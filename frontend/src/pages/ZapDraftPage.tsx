import {
  AddBlockButton,
  AppSelectionModal,
  BlockComponent,
  ConfigModal,
  ConfigModalInputModal,
  ZapPublishButton,
} from "@/components";
import {
  appsQuery,
  availableActionsQuery,
  availableTriggersQuery,
} from "@/lib/queries";
import { useWorkflowStore } from "@/store/workflowStore";
import { useZapCreationStore } from "@/store/zapStore";
import { QueryClient } from "@tanstack/react-query";

import React from "react";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";

export const loader =
  (queryClient: QueryClient) =>
  async ({
    params,
  }: LoaderFunctionArgs): Promise<
    Response | { triggers: any; actions: any; apps: any; zapId: string }
  > => {
    try {
      const triggers = await queryClient.ensureQueryData(
        availableTriggersQuery
      );
      const actions = await queryClient.ensureQueryData(availableActionsQuery);
      const apps = await queryClient.ensureQueryData(appsQuery);

      const zapId = params.zapId;
      if (!zapId) throw new Error("zapId is required");

      return { triggers, actions, apps, zapId };
    } catch (error) {
      return redirect("/");
    }
  };

const ZapDraftPage = () => {
  const { zapId } = useLoaderData();
  const [isAppModalOpen, setIsAppModalOpen] = React.useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [isConfigInputModalOpen, setIsConfigInputModalOpen] =
    React.useState(false);
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [currentBlockType, setCurrentBlockType] = React.useState<
    "trigger" | "action"
  >("trigger");
  const { blocks, addBlock } = useWorkflowStore();
  const { zapData } = useZapCreationStore();
  const [pendingBlockType, setPendingBlockType] = React.useState<
    "trigger" | "action" | null
  >(null);

  const handleAddBlock = (type: "trigger" | "action") => {
    setCurrentBlockType(type);
    setIsAppModalOpen(true);
    setPendingBlockType(type);
  };

  const handleAppSelect = (appId: string) => {
    if (pendingBlockType) {
      addBlock(pendingBlockType);
      console.log("pendingBlockType", pendingBlockType);
      // You might want to store the selected app ID in your store here
    }
    setIsAppModalOpen(false);
    setPendingBlockType(null);
    setSelectedAppId(appId);
    setIsConfigModalOpen(true);
  };

  const handleChangeApp = () => {
    setIsConfigModalOpen(false);
    setIsAppModalOpen(true);
    setIsConfigInputModalOpen(false);
  };
  console.log("isConfigInputModalOpen ", isConfigInputModalOpen);

  return (
    <>
      <ZapPublishButton
        zapId={zapId}
        title="Zaps"
        description="Create and customize your automation workflow"
      />
      <div
        className="bg-gray-50 rounded-lg min-h-[800px] pt-32 relative"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="p-8 space-y-6">
          {blocks.map((block, index) => {
            const action = zapData.actions.find(
              (action) => action.availableActionId === block.selectedId
            );
            return (
              <React.Fragment key={block.id}>
                <BlockComponent
                  index={index}
                  name={action?.actionName}
                  id={block.id}
                  setIsConfigModalOpen={setIsConfigModalOpen}
                  type={block.type}
                />
              </React.Fragment>
            );
          })}

          {blocks.length === 0 ? (
            <AddBlockButton onClick={() => handleAddBlock("trigger")} />
          ) : (
            <AddBlockButton onClick={() => handleAddBlock("action")} />
          )}
        </div>

        <AppSelectionModal
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          onSelectApp={handleAppSelect}
          type={currentBlockType}
        />

        <ConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onSelectNewApp={handleChangeApp}
          initialAppId={selectedAppId}
          type={currentBlockType}
          zapId={zapId}
          setIsConfigInputModalOpen={() => setIsConfigInputModalOpen(true)}
        />

        <ConfigModalInputModal
          isOpen={isConfigInputModalOpen}
          onClose={() => setIsConfigInputModalOpen(false)}
          onSelectNewApp={handleChangeApp}
          initialAppId={selectedAppId}
          type={currentBlockType}
          zapId={zapId}
        />
      </div>
    </>
  );
};

export default ZapDraftPage;
