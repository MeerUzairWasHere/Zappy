import { OAUTH_GMAIL } from "@/lib/links";
import {
  appsQuery,
  availableActionsQuery,
  availableTriggersQuery,
  connectionsQuery,
} from "@/lib/queries";
import useZapCreationStore from "@/store/zapStore";
import customFetch from "@/utils/fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

const ConfigModal = ({
  isOpen,
  onClose,
  onSelectNewApp,
  initialAppId,
  zapId,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewApp: () => void;
  initialAppId: string;
  zapId: string;
  type: "trigger" | "action";
}) => {
  const queryClient = useQueryClient();
  const { data: appsData } = useQuery(appsQuery);
  const { data: triggersData } = useQuery(availableTriggersQuery);
  const { data: actionsData } = useQuery(availableActionsQuery);
  const { data: connectionsData } = useQuery(connectionsQuery(initialAppId));
  const { setTriggerId, setTriggerName } = useZapCreationStore();
  const [selectedTriggerId, setSelectedTriggerId] = React.useState("");
  const [showConnectionModal, setShowConnectionModal] = React.useState(false);
  const [selectedConnection, setSelectedConnection] = React.useState<{
    id: string;
    user: {
      email: string;
    };
    email: string;
  }>();

  const currentApp = appsData?.apps.find((app: any) => app.id === initialAppId);
  const connections = connectionsData?.connections || [];

  const filteredItems = React.useMemo(() => {
    if (type === "trigger") {
      return triggersData?.availableTriggers.filter(
        (t: any) => t.appId === initialAppId
      );
    }
    return actionsData?.availableActions.filter(
      (a: any) => a.appId === initialAppId
    );
  }, [initialAppId, type, triggersData, actionsData]);

  const handleConnect = async () => {
    const authWindow = window.open(
      OAUTH_GMAIL,
      "Connect the account",
      "width=600,height=600"
    );

    if (!authWindow) {
      alert("Popup blocked! Allow popups and try again.");
      return;
    }

    const messageHandler = (event: MessageEvent) => {
      console.log(event.data);
      if (event.origin !== "http://localhost:3000") {
        console.error("Invalid origin:", event.origin);
        return;
      }

      if (event.data?.type === "oauth_complete" && event.data?.success) {
        console.log(event.data);
        setSelectedConnection({
          id: event.data.id,
          user: event.data,
          email: event.data.connectedEmail,
        });
        window.removeEventListener("message", messageHandler);
        queryClient.invalidateQueries({ queryKey: ["connections"] });
      } else {
        console.error("OAuth failed or incomplete data:", event.data);
      }
    };

    window.addEventListener("message", messageHandler);
  };

  const ConnectionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Connection</h3>
          <button
            onClick={() => setShowConnectionModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>
        <div className="space-y-4">
          {connections.map((connection: any) => (
            <button
              key={connection.id}
              onClick={() => {
                console.log(connection.id);
                setSelectedConnection({
                  id: connection.id,
                  user: connection.user,
                  email: connection.connectedEmail,
                });
                setShowConnectionModal(false);
              }}
              className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>{connection.connectedEmail}</span>
              {selectedConnection?.id === connection.id && (
                <span className="text-purple-600">✓</span>
              )}
            </button>
          ))}
          <button
            onClick={handleConnect}
            className="px-4 py-2  bg-purple-600 text-white rounded-md w-full hover:bg-purple-700"
          >
            Add New Account
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;
  console.log("connections: ", connections);
  console.log("selectedConnection: ", selectedConnection);
  console.log("selectedTriggerId: ", selectedTriggerId);
  console.log("zapId: ", zapId);
  console.log("initialAppId: ", initialAppId);

  async function handleOnClick() {
    if (!selectedConnection?.id) {
      toast.error("Please select a connection.");
      return;
    }

    if (!selectedTriggerId) {
      toast.error(`Please select a ${type}.`);
      return;
    }

    const payload = {
      appId: initialAppId,
      connectionId: selectedConnection.id,
      zapId: zapId,
      config: {
        name: "this is config",
      },
      metadata: {
        name: "this is meta data",
      },
      [type === "trigger" ? "triggerId" : "actionId"]: selectedTriggerId, // Dynamic key based on type
    };
    console.log("payload: ", payload);

    try {
      const endpoint =
        type === "trigger"
          ? `/triggers/${zapId}/configure`
          : `/actions/${zapId}/configure`;
      await customFetch.post(endpoint, payload);
      queryClient.invalidateQueries({ queryKey: ["zaps"] });
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      alert(`Failed to save ${type}. Please try again.`);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[520px] mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Configure {type}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected App
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 px-3 py-2 border rounded-md bg-gray-50">
                <div className="flex items-center">
                  {currentApp?.icon && (
                    <img
                      src={currentApp.icon}
                      alt=""
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <span>{currentApp?.name}</span>
                </div>
              </div>
              <button
                onClick={onSelectNewApp}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Change App
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {type}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              value={selectedTriggerId}
              onChange={(e) => {
                const selectedItem = filteredItems?.find(
                  (item: any) => item.id === e.target.value
                );
                setSelectedTriggerId(e.target.value);
                setTriggerId(e.target.value);
                setTriggerName(selectedItem?.name || ""); // ✅ Set trigger name here
              }}
            >
              <option value="">Select...</option>
              {filteredItems?.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg">
            <div>
              <h3 className="font-medium text-purple-700">
                {selectedConnection?.id
                  ? `Connected as ${selectedConnection.email}`
                  : `Connect ${currentApp?.name}`}
              </h3>
              <p className="text-sm text-purple-600">
                {selectedConnection?.id
                  ? "Account connected successfully"
                  : "Authorization required to proceed"}
              </p>
            </div>
            {connections.length > 0 ? (
              <button
                onClick={() => setShowConnectionModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Select
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Connect
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleOnClick}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={!selectedTriggerId || !selectedConnection?.id} // Disable if no trigger or connection is selected
            >
              Save
            </button>
          </div>
        </div>
      </div>
      {showConnectionModal && <ConnectionModal />}
    </div>
  );
};

export default ConfigModal;
