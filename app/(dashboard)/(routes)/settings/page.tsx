"use client";

import Heading from "@/components/heading";
import { Settings } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const SettingsPage = () => {
  return (
    <div>
      <Heading
        title="Settings"
        description="Manage account settings."
        icon={Settings}
        iconColor="text-gray-500"
        bgColor="bg-gray-500/10"
      />

      <div className="px-4 lg:px-8 space-y-6">
        {/* Subscription Card */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white dark:bg-white/[0.04]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            Subscription Plan
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            You are currently on the <span className="font-bold text-zinc-900 dark:text-white">Free</span> plan.
          </p>
          <Button variant="premium">
            <Zap className="w-4 h-4 mr-2 fill-white" />
            Upgrade to Pro
          </Button>
        </div>

        {/* Account Info */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white dark:bg-white/[0.04]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            Account
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Manage your account preferences and profile information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 p-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                user@example.com
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 p-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Plan
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Free Tier — 5 generations / month
              </p>
            </div>
          </div>
        </div>

        {/* API Usage */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white dark:bg-white/[0.04]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            API Usage
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Track your API generation usage.
          </p>
          <div className="h-3 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden max-w-md">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: "40%" }}
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            2 / 5 free generations used
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
