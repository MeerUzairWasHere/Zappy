// AppSelectionModal.tsx
import React from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { appsQuery } from "@/lib/queries";

const AppSelectionModal = ({
  isOpen,
  onClose,
  onSelectApp,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: string) => void;
  type: "trigger" | "action";
}) => {
  const { data: appsData } = useQuery(appsQuery);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Select App for {type === "trigger" ? "Trigger" : "Action"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {appsData?.apps.map((app: any) => (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                {app.icon ? (
                  <img src={app.icon} alt={app.name} className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-medium">{app.name}</h3>
                <p className="text-sm text-gray-500">{app.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppSelectionModal;
