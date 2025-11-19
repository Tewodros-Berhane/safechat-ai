"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Users, UserMinus, UserPlus } from "lucide-react";

export default function FriendsPanel() {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    fetchFriends,
    respondToRequest,
    removeFriend,
  } = useFriendsStore();

  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleRespond = async (requestId: number, action: "ACCEPT" | "REJECT") => {
    setProcessingRequestId(requestId);
    const success = await respondToRequest(requestId, action);
    setProcessingRequestId(null);
    if (success) {
      toast.success(action === "ACCEPT" ? "Friend request accepted" : "Friend request declined");
    } else {
      toast.error("Unable to update request. Please try again.");
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    setRemovingFriendId(userId);
    const success = await removeFriend(userId);
    setRemovingFriendId(null);
    if (success) {
      toast.success("Friend removed");
    } else {
      toast.error("Unable to remove friend");
    }
  };

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Users className="w-5 h-5 text-gray-600" />
          Friends & Requests
        </CardTitle>
        <p className="text-sm text-gray-500">
          Manage your connections. Private users must approve a request before chatting.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Friends ({friends.length})</h3>
            {loading && <span className="text-xs text-gray-400">Refreshing…</span>}
          </div>
          {friends.length === 0 ? (
            <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-4 text-center">
              No friends yet. Use the chat sidebar to send requests.
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.profilePic || undefined} alt={friend.username} />
                      <AvatarFallback className="bg-[#04C99B]/15 text-[#007AFF] font-semibold">
                        {friend.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{friend.username}</p>
                      <p className="text-xs text-gray-500">
                        Friends since{" "}
                        {formatDistanceToNow(new Date(friend.friendSince), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={removingFriendId === friend.id}
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    <UserMinus className="w-4 h-4 mr-1.5" />
                    {removingFriendId === friend.id ? "Removing…" : "Unfriend"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Incoming requests ({incomingRequests.length})
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-3 text-center">
                No pending requests at the moment.
              </p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={request.user.profilePic || undefined} alt={request.user.username} />
                        <AvatarFallback>{request.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{request.user.username}</p>
                        <p className="text-xs text-gray-500">
                          Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                        disabled={processingRequestId === request.id}
                        onClick={() => handleRespond(request.id, "REJECT")}
                      >
                        {processingRequestId === request.id ? "..." : "Reject"}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#04C99B] hover:bg-[#04C99B]/90 text-white"
                        disabled={processingRequestId === request.id}
                        onClick={() => handleRespond(request.id, "ACCEPT")}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        {processingRequestId === request.id ? "Working…" : "Accept"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Outgoing requests ({outgoingRequests.length})
            </h3>
            {outgoingRequests.length === 0 ? (
              <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-3 text-center">
                You haven&apos;t sent any requests.
              </p>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={request.user.profilePic || undefined} alt={request.user.username} />
                        <AvatarFallback>{request.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{request.user.username}</p>
                        <p className="text-xs text-gray-500">
                          Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
