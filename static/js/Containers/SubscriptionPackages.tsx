import React from "react";
import SubscriptionCard from "../Components/SubscriptionCard";
import { Divider } from "@mui/material";

const SubscriptionPackages = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-xl">Subscribed Package</p>
      {/* Will Add Subscription cards in the next PR */}
      <div className="flex flex-row gap-4">
        <SubscriptionCard />
      </div>
      <div className="my-2">
        <Divider />
      </div>
      <p className="text-xl">Other Packages</p>
      <div className="flex flex-row gap-4">
        <SubscriptionCard />
        <SubscriptionCard />
      </div>
    </div>
  );
};

export default SubscriptionPackages;