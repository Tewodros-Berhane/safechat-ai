import { create } from "zustand";

export interface FriendUser {
  id: number;
  username: string;
  profilePic: string | null;
  isPrivate: boolean;
  isOnline?: boolean;
  lastSeen?: string | null;
}

export interface FriendEntry extends FriendUser {
  friendSince: string;
}

export interface FriendRequestEntry {
  id: number;
  createdAt: string;
  user: FriendUser;
}

interface FriendsApiResponse {
  friends?: FriendEntry[];
  requests?: {
    incoming?: {
      id: number;
      createdAt: string;
      requester: FriendUser;
    }[];
    outgoing?: {
      id: number;
      createdAt: string;
      receiver: FriendUser;
    }[];
  };
}

interface FriendsState {
  friends: FriendEntry[];
  incomingRequests: FriendRequestEntry[];
  outgoingRequests: FriendRequestEntry[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;

  fetchFriends: (force?: boolean) => Promise<void>;
  sendFriendRequest: (userId: number) => Promise<boolean>;
  respondToRequest: (requestId: number, action: "ACCEPT" | "REJECT") => Promise<boolean>;
  removeFriend: (userId: number) => Promise<boolean>;
  updatePresence: (userId: number, presence: Partial<{ isOnline?: boolean; lastSeen?: string }>) => void;
  reset: () => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  loading: false,
  error: null,
  hasFetched: false,

  fetchFriends: async (force = false) => {
    const { loading, hasFetched } = get();
    if (loading || (!force && hasFetched)) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/friends");
      if (!response.ok) {
        throw new Error("Failed to load friends data");
      }
      const data: FriendsApiResponse = await response.json();
      const incoming: FriendRequestEntry[] = (data.requests?.incoming || []).map(
        (req) => ({
          id: req.id,
          createdAt: req.createdAt,
          user: req.requester,
        })
      );
      const outgoing: FriendRequestEntry[] = (data.requests?.outgoing || []).map(
        (req) => ({
          id: req.id,
          createdAt: req.createdAt,
          user: req.receiver,
        })
      );

      set({
        friends: data.friends || [],
        incomingRequests: incoming,
        outgoingRequests: outgoing,
        loading: false,
        hasFetched: true,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching friends data:", error);
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load friends data",
      });
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send friend request");
      }

      const data = await response.json();
      const request = data.request;
      if (request?.receiver) {
        set((state) => ({
          outgoingRequests: [
            {
              id: request.id,
              createdAt: request.createdAt,
              user: request.receiver,
            },
            ...state.outgoingRequests.filter((req) => req.user.id !== request.receiver.id),
          ],
        }));
      }

      return true;
    } catch (error) {
      console.error("Error sending friend request:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to send friend request",
      });
      return false;
    }
  },

  respondToRequest: async (requestId, action) => {
    try {
      const response = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update friend request");
      }

      const data = await response.json();

      set((state) => {
        const updatedIncoming = state.incomingRequests.filter(
          (req) => req.id !== requestId
        );
        let updatedFriends = state.friends;
        if (action === "ACCEPT" && data.friend) {
          const alreadyFriend = state.friends.some(
            (friend) => friend.id === data.friend.id
          );
          if (!alreadyFriend) {
            updatedFriends = [
              {
                ...data.friend,
                friendSince: new Date().toISOString(),
              },
              ...state.friends,
            ];
          }
        }

        return {
          incomingRequests: updatedIncoming,
          friends: updatedFriends,
        };
      });

      return true;
    } catch (error) {
      console.error("Error updating friend request:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update friend request",
      });
      return false;
    }
  },

  removeFriend: async (userId) => {
    try {
      const response = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove friend");
      }

      set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== userId),
      }));

      return true;
    } catch (error) {
      console.error("Error removing friend:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to remove friend",
      });
      return false;
    }
  },

  updatePresence: (userId, presence) =>
    set((state) => ({
      friends: state.friends.map((friend) =>
        friend.id === userId ? { ...friend, ...presence } : friend
      ),
      incomingRequests: state.incomingRequests.map((req) =>
        req.user.id === userId ? { ...req, user: { ...req.user, ...presence } } : req
      ),
      outgoingRequests: state.outgoingRequests.map((req) =>
        req.user.id === userId ? { ...req, user: { ...req.user, ...presence } } : req
      ),
    })),

  reset: () =>
    set({
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      loading: false,
      error: null,
      hasFetched: false,
    }),
}));
