import { Protect } from "@clerk/nextjs";
import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { CustomizationsView } from "@/modules/customizations/ui/views/customizations-view";
import React from "react";

const page = () => {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <CustomizationsView />
        </PremiumFeatureOverlay>
      }
    >
      <CustomizationsView />
    </Protect>
  );
};

export default page;
