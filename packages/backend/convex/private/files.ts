import { ConvexError, v } from "convex/values";
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { en } from "zod/v4/locales";

function guessMimeType(filename: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
}

export const deleteFile = mutation({
  args: {
    entryId: vEntryId
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId
    });

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    };

    const entry = await rag.getEntry(ctx, {
      entryId: args.entryId
    });

    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    };

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization Id",
      });
    };

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
    }

    await rag.deleteAsync(ctx, {
      entryId: args.entryId,
    });
  }
})

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const { bytes, filename, category } = args;

    const mimeType = args.mimeType || guessMimeType(filename, bytes);
    const blob = new Blob([bytes], { type: mimeType });

    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      filename,
      bytes,
      mimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: filename,
      title: filename,
      metadata: {
        storageId,
        uploadedBy: orgId,
        filename,
        category: category ?? null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    if (!created) {
      console.log("entry already exists, skipping upload metadata");
      await ctx.storage.delete(storageId);
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});

export const list = query({
  // Defines arguments the query accepts: an optional 'category' string
  // and pagination options for loading data in chunks.
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    // 2. Authorization: Get the user's organization ID from their identity token.
    const orgId = identity.orgId as string;

    if (!orgId) {
      // If the user isn't part of an organization, throw an error.
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // 3. Namespace Retrieval: It looks for a "namespace" tied to the organization.
    // 'rag' likely stands for Retrieval-Augmented Generation, suggesting these files
    // might be used with an AI or search system. The orgId is used as the namespace.
    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId
    });

    if (!namespace) {
      // If no namespace/files exist for this org, return an empty list.
      return {
        page: [],
        isDone: true,
        continueCursor: ""
      }
    }

    // 4. List Internal Records: It fetches the raw file records ('Entry' objects)
    // from the RAG system for the given namespace.
    const results = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts
    });

    // 5. Data Transformation: It takes the list of raw 'Entry' objects and,
    // for each one, calls the 'convertEntryToPublicFile' function to create
    // a clean, public-facing file object.
    const files = await Promise.all(
      results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
    );

    const filteredFiles = args.category ? files.filter((file) => file.category === args.category) : files;

    return {
      page: filteredFiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor
    }
  }
});

export type PublicFile = {
  id: EntryId;
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  url: string | null;
  category?: string;
}

type EntryMetaData = {
  storageId: Id<"_storage">;
  uploadedBy: string;
  filename: string;
  category: string | null
}

async function convertEntryToPublicFile(ctx: QueryCtx,
  entry: Entry
): Promise<PublicFile> {
  // Gets metadata stored with the file, like its storageId and original filename.
  const metaData = entry.metadata as EntryMetaData | undefined;
  const storageId = metaData?.storageId;

  let fileSize = "unknown";

  if (storageId) {
    // If we have a storage ID, try to get the file's metadata from the database.
    try {
      const storageMetadata = await ctx.db.system.get(storageId);

      if (storageMetadata) {
        // If found, format the size (in bytes) into a readable string (e.g., "1.2 MB").
        fileSize = formatFileSize(storageMetadata.size);
      }
    } catch (error) {
      // Log an error if fetching metadata fails, but don't crash.
      console.error("Failed to get storage metadata: ", error);
    }
  }

  // Determine the file's name and extension.
  const filename = entry.key || "unknown";
  const extension = filename.split(".").pop()?.toLowerCase() || "txt";

  // Convert the internal status ('pending', 'ready') to a user-friendly one.
  let status: "ready" | "processing" | "error" = "error";

  if (entry.status === "ready") {
    status = "ready";
  } else if (entry.status === "pending") {
    status = "processing";
  }

  // Generate a temporary, secure URL to download the file if it exists in storage.
  const url = storageId ? await ctx.storage.getUrl(storageId) : null;

  // Finally, build and return the clean 'PublicFile' object.
  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    size: fileSize,
    status,
    url,
    category: metaData?.category || undefined
  }
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 bytes";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  // Use logarithms to figure out which unit to use (B, KB, MB, etc.)
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Calculate the value and format it to one decimal place.
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
