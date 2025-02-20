import { ZapStatus, Zap as ZapType } from "@/lib/types";
import { Zap } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import DeleteZapModal from "./DeleteZapModal";
import { userQuery, zapsQuery } from "@/lib/queries";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { redirect } from "react-router-dom";
import NoZapFound from "./NoZapFound";
import { WEBHOOK_BASE_URL } from "@/lib/links";
import CopyableWebhookUrl from "./CopyableWebhookUrl";
import ZapToggleSwitch from "./ZapToggleButton";

export const loader = (queryClient: QueryClient) => async () => {
  try {
    const { data } = await queryClient.ensureQueryData(zapsQuery);
    return data;
  } catch (error) {
    return redirect("/");
  }
};

const ZapListTable = ({ dashboard }: { dashboard?: boolean }) => {
  const getStatusColor = (status: ZapStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const { data, isLoading } = useQuery(zapsQuery);
  const zaps: ZapType[] = data?.zaps;
  const {
    data: { user },
  } = useQuery(userQuery);

  dayjs.extend(relativeTime);
  return (
    <>
      {!isLoading ? (
        <>
          {zaps?.length > 0 ? (
            <>
              <div className="bg-white rounded-lg border border-neutral-200/20 overflow-hidden">
                <div className="p-6 border-b border-neutral-200/20">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recent Zaps
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Webhook URL
                        </th>
                        <th className="hidden md:block px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Run
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Edit
                        </th> */}
                        {!dashboard && (
                          <>
                            <th className="px-6 py-3  text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Toggle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200/20">
                      {zaps?.map((zap) => {
                        const createdFromNow = dayjs(zap.createdAt).fromNow();
                        // Get all apps used in the Zap (trigger + actions)
                        const usedApps = new Map();

                        // Add trigger app if it exists
                        if (zap.trigger?.app) {
                          usedApps.set(zap.trigger.app.id, zap.trigger.app);
                        }
                        console.log(zap)

                        // Add unique action apps
                        zap.actions.forEach((action) => {
                          if (action.app) {
                            usedApps.set(action.app.id, action.app);
                          }
                        });

                        // Convert Map to Array for rendering
                        const uniqueApps = Array.from(usedApps.values());
                        return (
                          <tr key={zap.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <Zap className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="ml-4 grid gap-1">
                                  {/* Zap Name */}
                                  <div className="text-sm font-semibold text-gray-900">
                                    {zap.zapName}
                                  </div>

                                  {/* Trigger & Actions */}
                                  <div className="text-sm text-gray-500 flex items-center gap-1 flex-wrap">
                                    {uniqueApps.map((app) => (
                                      <img
                                        key={app.id}
                                        src={app.icon}
                                        alt={app.name}
                                        className="w-6 h-6 border border-gray-200 p-[2px] rounded-md"
                                        title={app.name}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <CopyableWebhookUrl
                                url={`${WEBHOOK_BASE_URL}/hooks/catch/${user.userId}/${zap.id}`}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:block">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 mt-3 font-semibold rounded-full ${getStatusColor(
                                  zap.status
                                )}`}
                              >
                                {zap.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {/* @ts-ignore */}
                              {createdFromNow}
                            </td>

                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link
                                to={`/dashboard/zaps/draft/${zap.id}`}
                                className="text-white bg-purple-500 px-2 rounded-2xl"
                              >
                                Edit
                              </Link>
                            </td> */}

                            {!dashboard && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium gap-1">
                                <ZapToggleSwitch
                                  zapId={zap.id}
                                  initialStatus={zap.status}
                                />
                              </td>
                            )}
                            {!dashboard && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium gap-1 ">
                                <DeleteZapModal zapId={zap.id} />
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <NoZapFound />
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200/20 overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-neutral-200/20">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                </tr>
              </thead>
              {/* Table Rows */}
              <tbody className="bg-white divide-y divide-neutral-200/20">
                {Array.from({ length: 7 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-36 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
export default ZapListTable;
