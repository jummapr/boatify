import React from "react";
import { OrganizationList } from "@clerk/nextjs";

export const OrgSelectView = () => {
  return (
    <div>
      <OrganizationList
        afterCreateOrganizationUrl={"/"}
        afterSelectOrganizationUrl={"/"}
        hidePersonal
        skipInvitationScreen
      />
    </div>
  );
};

