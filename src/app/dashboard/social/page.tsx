'use client'

import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    UserCheck,
    UserX,
    Users,
    Search,
    Check,
    X,
    User,
    MessageSquare,
    BarChart2,
    Award,
    ChevronDown,
    ChevronUp,
    Clock
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Friend {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status?: string; // Friendship status: 'pending', 'accepted'
    stats?: {
        workouts: number;
        streak: number;
        averageMinutes: number;
    };
}

interface FriendRequest {
    id: string;
    sender: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    created_at: string;
}

interface FriendshipWithUser {
    user_id: string;
    friend_id: string;
    status: string;
    created_at: string;
    users: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface PendingRequest {
    id: string;
    created_at: string;
    sender: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    user_id: string;  // Add this to store the full UUID
    friend_id: string; // Add this to store the full UUID
}

// Add interface for workout stats
interface WorkoutStats {
    workouts: number;
    streak: number;
    averageMinutes: number;
}

export default function SocialPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<Friend[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [activeSection, setActiveSection] = useState('friends');
    const [expandedFriend, setExpandedFriend] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [timePeriod, setTimePeriod] = useState('week');
    const [sessions, setSessions] = useState<any[]>([]);
    const [weekDateSet, setWeekDateSet] = useState(new Set());

    const router = useRouter();
    const supabase = createClient();

    // Fetch user data and initialize all required data
    useEffect(() => {
        async function initialize() {
            try {
                setDataLoading(true);
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    console.error('Error fetching user:', error);
                    router.push('/auth/login');
                    return;
                }

                setUserData(user);

                // Fetch all data in parallel for efficiency
                await Promise.all([
                    fetchFriends(user.id),
                    fetchPendingRequests(user.id),
                    fetchSentRequests(user.id)
                ]);
            } catch (err) {
                console.error('Error initializing social data:', err);
                showNotification('error', 'Failed to load your social data');
            } finally {
                setDataLoading(false);
            }
        }

        initialize();
    }, [router]);

    useEffect(() => {
        if (timePeriod === 'week') {
            // Debug: print the week date set
            console.log('Week Date Set:', Array.from(weekDateSet));
            // Debug: print each session's date string and completion status
            sessions.forEach(s => {
                if (s && s.session_date && typeof s.completed !== 'undefined') {
                    console.log('Session:', getDateString(s.session_date), '| Completed:', s.completed);
                }
            });
        }
    }, [sessions, timePeriod, weekDateSet]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    // Add function to calculate streak
    const calculateStreak = (workoutDates: string[]): number => {
        if (!workoutDates.length) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = workoutDates
            .map(date => new Date(date))
            .sort((a, b) => b.getTime() - a.getTime());

        let streak = 0;
        let currentDate = today;

        for (let i = 0; i < dates.length; i++) {
            const workoutDate = dates[i];
            workoutDate.setHours(0, 0, 0, 0);

            // If there's a gap of more than 1 day, break the streak
            if (i > 0) {
                const prevDate = dates[i - 1];
                const dayDiff = Math.floor((prevDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff > 1) break;
            }

            // If the workout was today or yesterday, count it
            const dayDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff <= 1) {
                streak++;
                currentDate = workoutDate;
            } else {
                break;
            }
        }

        return streak;
    };

    // Add function to fetch workout stats
    const fetchWorkoutStats = async (userId: string): Promise<WorkoutStats> => {
        try {
            // Fetch all workout sessions for the user
            const { data: workouts, error } = await supabase
                .from('workout_sessions')
                .select('session_date, duration_minutes')
                .eq('user_id', userId)
                .order('session_date', { ascending: false });

            if (error) throw error;

            if (!workouts || workouts.length === 0) {
                return {
                    workouts: 0,
                    streak: 0,
                    averageMinutes: 0
                };
            }

            // Calculate total workouts
            const totalWorkouts = workouts.length;

            // Calculate average duration
            const totalMinutes = workouts.reduce((sum, workout) => sum + (workout.duration_minutes || 0), 0);
            const averageMinutes = Math.round(totalMinutes / totalWorkouts);

            // Calculate streak
            const workoutDates = workouts.map(w => w.session_date);
            const streak = calculateStreak(workoutDates);

            return {
                workouts: totalWorkouts,
                streak,
                averageMinutes
            };
        } catch (err) {
            console.error('Error fetching workout stats:', err);
            return {
                workouts: 0,
                streak: 0,
                averageMinutes: 0
            };
        }
    };

    // Update fetchFriends to include real stats
    const fetchFriends = async (userId: string) => {
        try {
            // Get all friendships where the user is part of the relationship and status is accepted
            const { data: outgoingFriends, error: outgoingError } = await supabase
                .from('friendships')
                .select('friend_id')
                .eq('user_id', userId)
                .eq('status', 'accepted');

            if (outgoingError) throw outgoingError;

            const { data: incomingFriends, error: incomingError } = await supabase
                .from('friendships')
                .select('user_id')
                .eq('friend_id', userId)
                .eq('status', 'accepted');

            if (incomingError) throw incomingError;

            // Combine friend IDs from both directions
            const outgoingIds = outgoingFriends?.map(item => item.friend_id) || [];
            const incomingIds = incomingFriends?.map(item => item.user_id) || [];
            const allFriendIds = [...outgoingIds, ...incomingIds];

            if (allFriendIds.length === 0) {
                setFriends([]);
                return;
            }

            // Fetch all friend details in a single query
            const { data: friendData, error: friendError } = await supabase
                .from('users')
                .select('id, first_name, last_name, email')
                .in('id', allFriendIds);

            if (friendError) throw friendError;

            // Fetch workout stats for each friend
            const friendsWithStats = await Promise.all(
                (friendData || []).map(async (friend) => {
                    const stats = await fetchWorkoutStats(friend.id);
                    return {
                        ...friend,
                        status: 'accepted',
                        stats
                    };
                })
            );

            setFriends(friendsWithStats);
        } catch (err) {
            console.error('Error fetching friends:', err);
            showNotification('error', 'Failed to load friends');
        }
    };

    // Fetch pending friend requests (where current user is the recipient)
    const fetchPendingRequests = async (userId: string) => {
        try {
            // First get the pending friendships where current user is the recipient
            const { data: friendships, error: friendshipsError } = await supabase
                .from('friendships')
                .select(`
                    user_id,
                    friend_id,
                    status,
                    created_at,
                    users:user_id (
                        id,
                        first_name,
                        last_name,
                        email
                    )
                `)
                .eq('friend_id', userId)
                .eq('status', 'pending')
                .returns<FriendshipWithUser[]>();

            if (friendshipsError) {
                console.error('Error fetching friendships:', friendshipsError);
                throw friendshipsError;
            }

            if (!friendships || friendships.length === 0) {
                setPendingRequests([]);
                return;
            }

            // Map the data to our expected format
            const formattedRequests = friendships.map(friendship => {
                return {
                    id: `${friendship.user_id}-${friendship.friend_id}`,
                    created_at: friendship.created_at,
                    user_id: friendship.user_id,    // Store the full UUID
                    friend_id: friendship.friend_id, // Store the full UUID
                    sender: {
                        id: friendship.users.id,
                        first_name: friendship.users.first_name,
                        last_name: friendship.users.last_name,
                        email: friendship.users.email
                    }
                };
            });

            setPendingRequests(formattedRequests);
        } catch (err) {
            console.error('Error fetching pending requests:', err);
            showNotification('error', 'Failed to load friend requests');
        }
    };

    // Fetch sent friend requests (where current user is the sender)
    const fetchSentRequests = async (userId: string) => {
        try {
            // First get the friendship records
            const { data, error } = await supabase
                .from('friendships')
                .select('friend_id')
                .eq('user_id', userId)
                .eq('status', 'pending');

            if (error) throw error;

            if (!data || data.length === 0) {
                setSentRequests([]);
                return;
            }

            // Get all recipient IDs
            const recipientIds = data.map(item => item.friend_id);

            // Fetch user details for these IDs
            const { data: recipientData, error: recipientError } = await supabase
                .from('users')
                .select('id, first_name, last_name, email')
                .in('id', recipientIds);

            if (recipientError) throw recipientError;

            // Add status to each recipient
            const recipientsWithStatus = (recipientData || []).map(user => ({
                ...user,
                status: 'pending'
            }));

            setSentRequests(recipientsWithStatus);
        } catch (err) {
            console.error('Error fetching sent requests:', err);
        }
    };

    // Search for users
    const handleSearch = async () => {
        if (!searchQuery.trim() || !userData) return;

        try {
            setSearchLoading(true);

            // Check if search query looks like an email
            const isEmailSearch = searchQuery.includes('@');

            // Build the search query based on whether it looks like an email
            let searchFilter;

            if (isEmailSearch) {
                // For email searches, we prioritize exact matches
                // Try an exact match first
                const { data: exactMatch, error: exactMatchError } = await supabase
                    .from('users')
                    .select('id, first_name, last_name, email')
                    .eq('email', searchQuery.trim())
                    .neq('id', userData.id) // Exclude current user
                    .limit(1);

                if (exactMatchError) throw exactMatchError;

                // If we found an exact match, use that instead of doing a broader search
                if (exactMatch && exactMatch.length > 0) {
                    // Get friendship status for the exact match
                    const { data: existingFriendship, error: friendshipError } = await supabase
                        .from('friendships')
                        .select('status')
                        .or(`and(user_id.eq.${userData.id},friend_id.eq.${exactMatch[0].id}),and(user_id.eq.${exactMatch[0].id},friend_id.eq.${userData.id})`)
                        .limit(1);

                    if (friendshipError) throw friendshipError;

                    // Add status to the result
                    const resultWithStatus = {
                        ...exactMatch[0],
                        status: existingFriendship && existingFriendship.length > 0
                            ? existingFriendship[0].status
                            : undefined,
                        exactMatch: true // Mark this as an exact match
                    };

                    setSearchResults([resultWithStatus]);
                    setSearchLoading(false);
                    return;
                }

                // If no exact match, fall back to a partial email search
                searchFilter = `email.ilike.%${searchQuery}%`;
            } else {
                // If it's not an email, do partial matching on names
                searchFilter = `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`;
            }

            // Perform the search using the filter
            const { data, error } = await supabase
                .from('users')
                .select('id, first_name, last_name, email')
                .or(searchFilter)
                .neq('id', userData.id) // Exclude current user
                .limit(10);

            if (error) throw error;

            // Determine friendship status for each result
            const resultsWithStatus = await Promise.all((data || []).map(async (user) => {
                // Check if there's a friendship in either direction
                const { data: existingFriendship, error: friendshipError } = await supabase
                    .from('friendships')
                    .select('status')
                    .or(`and(user_id.eq.${userData.id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${userData.id})`)
                    .limit(1);

                if (friendshipError) throw friendshipError;

                return {
                    ...user,
                    status: existingFriendship && existingFriendship.length > 0
                        ? existingFriendship[0].status
                        : undefined
                };
            }));

            setSearchResults(resultsWithStatus);
        } catch (err) {
            console.error('Error searching for users:', err);
        } finally {
            setSearchLoading(false);
        }
    };

    // Send a friend request
    const sendFriendRequest = async (friendId: string) => {
        if (!userData) return;

        try {
            // Create a new pending friendship record
            const { error } = await supabase
                .from('friendships')
                .insert({
                    user_id: userData.id,
                    friend_id: friendId,
                    status: 'pending'
                });

            if (error) throw error;

            // Update the search results to reflect the sent request
            setSearchResults(prevResults =>
                prevResults.map(result =>
                    result.id === friendId
                        ? { ...result, status: 'pending' }
                        : result
                )
            );

            // Also update sent requests
            const userToAdd = searchResults.find(user => user.id === friendId);
            if (userToAdd) {
                setSentRequests(prev => [...prev, { ...userToAdd, status: 'pending' }]);
            }
        } catch (err) {
            console.error('Error sending friend request:', err);
        }
    };

    // Update acceptFriendRequest to include real stats
    const acceptFriendRequest = async (requestId: string) => {
        try {
            // Find the request in our state
            const request = pendingRequests.find(req => req.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            // Use the stored UUIDs directly
            const { error } = await supabase
                .from('friendships')
                .update({ status: 'accepted' })
                .match({
                    user_id: request.user_id,
                    friend_id: request.friend_id
                });

            if (error) {
                console.error('Error updating friendship:', error);
                throw error;
            }

            // Fetch real workout stats for the new friend
            const stats = await fetchWorkoutStats(request.sender.id);

            // Add to friends list with real stats
            const newFriend = {
                ...request.sender,
                status: 'accepted',
                stats
            };
            setFriends(prev => [...prev, newFriend]);

            // Remove from pending requests
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));

            showNotification('success', 'Friend request accepted');
        } catch (err) {
            console.error('Error accepting friend request:', err);
            showNotification('error', 'Failed to accept friend request');
        }
    };

    // Reject/cancel a friend request
    const rejectFriendRequest = async (requestId: string) => {
        try {
            // Find the request in our state
            const request = pendingRequests.find(req => req.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            // Use the stored UUIDs directly
            const { error } = await supabase
                .from('friendships')
                .delete()
                .match({
                    user_id: request.user_id,
                    friend_id: request.friend_id
                });

            if (error) {
                console.error('Error deleting friendship:', error);
                throw error;
            }

            // Remove from pending requests
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
            showNotification('success', 'Friend request rejected');
        } catch (err) {
            console.error('Error rejecting friend request:', err);
            showNotification('error', 'Failed to reject friend request');
        }
    };

    // Cancel a sent friend request
    const cancelFriendRequest = async (friendId: string) => {
        if (!userData) return;

        try {
            // Delete the friendship record
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('user_id', userData.id)
                .eq('friend_id', friendId);

            if (error) throw error;

            // Update sent requests
            setSentRequests(prev => prev.filter(user => user.id !== friendId));

            // Update search results if applicable
            setSearchResults(prev =>
                prev.map(user =>
                    user.id === friendId
                        ? { ...user, status: undefined }
                        : user
                )
            );
        } catch (err) {
            console.error('Error canceling friend request:', err);
        }
    };

    // Remove a friend
    const removeFriend = async (friendId: string) => {
        if (!userData) return;

        try {
            // Delete friendship in both directions
            await supabase
                .from('friendships')
                .delete()
                .or(`and(user_id.eq.${userData.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userData.id})`);

            // Update friends list
            setFriends(prev => prev.filter(friend => friend.id !== friendId));

            // Update search results if applicable
            setSearchResults(prev =>
                prev.map(user =>
                    user.id === friendId
                        ? { ...user, status: undefined }
                        : user
                )
            );
        } catch (err) {
            console.error('Error removing friend:', err);
        }
    };

    // Toggle expanded friend for detailed view
    const toggleExpandFriend = (friendId: string) => {
        setExpandedFriend(prev => prev === friendId ? null : friendId);
    };

    // Fix: define getDateString helper for debug
    const getDateString = (dateInput: string | Date) => {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (dataLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Social Connections</h1>
                <Link href="/dashboard">
                    <button className="bg-transparent hover:bg-white/10 p-2 rounded-lg transition-colors">
                        Back to Dashboard
                    </button>
                </Link>
            </div>

            {/* Friend Search Section */}
            <div className="bg-slate-800/70 p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-400" />
                    Find New Friends
                </h2>

                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Enter email address to find users"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 pl-10"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searchLoading || !searchQuery.trim()}
                        className="px-6 py-3 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg font-medium">Search Results</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {searchResults.map((user) => (
                                <div key={user.id} className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center border border-slate-600/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white">
                                            {user.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                    </div>

                                    <div>
                                        {!user.status && (
                                            <button
                                                onClick={() => sendFriendRequest(user.id)}
                                                className="px-3 py-2 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors flex items-center gap-2"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Add Friend
                                            </button>
                                        )}

                                        {user.status === 'pending' && (
                                            <button
                                                onClick={() => cancelFriendRequest(user.id)}
                                                className="px-3 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel Request
                                            </button>
                                        )}

                                        {user.status === 'accepted' && (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <UserCheck className="w-5 h-5" />
                                                <span>Already Friends</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results Message for Email Search */}
                {searchQuery.includes('@') && searchResults.length === 0 && !searchLoading && (
                    <div className="bg-slate-700/30 rounded-lg p-4 mt-4 border border-slate-600/50">
                        <p className="text-center text-slate-300">No user found with email: <span className="font-medium">{searchQuery}</span></p>
                        <p className="text-center text-slate-400 text-sm mt-2">Make sure the email is typed correctly or invite them to join StepSync</p>
                    </div>
                )}
            </div>

            {/* Section Tabs */}
            <div className="flex space-x-3">
                <button
                    onClick={() => setActiveSection('friends')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeSection === 'friends'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    <UserCheck className="w-4 h-4" />
                    <span>My Friends ({friends.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection('requests')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeSection === 'requests'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Friend Requests ({pendingRequests.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection('sent')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeSection === 'sent'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                >
                    <User className="w-4 h-4" />
                    <span>Sent Requests ({sentRequests.length})</span>
                </button>
            </div>

            {/* Active Section Content */}
            <div className="bg-slate-800/70 p-6 rounded-xl border border-slate-700/50 shadow-lg">
                {/* Friends List */}
                {activeSection === 'friends' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            My Friends
                        </h2>

                        {friends.length > 0 ? (
                            <div className="space-y-4">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                                    >
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white">
                                                    {friend.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{friend.first_name} {friend.last_name}</p>
                                                    <p className="text-sm text-gray-400">{friend.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleExpandFriend(friend.id)}
                                                    className="p-2 rounded-lg hover:bg-slate-600/70 transition-colors"
                                                >
                                                    {expandedFriend === friend.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>

                                                <button
                                                    onClick={() => removeFriend(friend.id)}
                                                    className="p-2 text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                                                    title="Remove friend"
                                                >
                                                    <UserX className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedFriend === friend.id && (
                                            <div className="mt-4 pt-4 border-t border-slate-600/50">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/20 rounded-full">
                                                            <BarChart2 className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-400">Workouts</p>
                                                            <p className="font-medium">{friend.stats?.workouts}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                                        <div className="p-2 bg-green-500/20 rounded-full">
                                                            <Award className="w-5 h-5 text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-400">Current Streak</p>
                                                            <p className="font-medium">{friend.stats?.streak} days</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                                                        <div className="p-2 bg-purple-500/20 rounded-full">
                                                            <Clock className="w-5 h-5 text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-400">Avg. Workout</p>
                                                            <p className="font-medium">{friend.stats?.averageMinutes} min</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium mb-2">No friends yet</h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-4">
                                    Use the search bar above to find and add friends.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Requests */}
                {activeSection === 'requests' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-purple-400" />
                            Friend Requests
                        </h2>

                        {pendingRequests.length > 0 ? (
                            <div className="space-y-4">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center border border-slate-600/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white">
                                                {request.sender.first_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{request.sender.first_name} {request.sender.last_name}</p>
                                                <p className="text-sm text-gray-400">{request.sender.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => acceptFriendRequest(request.id)}
                                                className="px-3 py-2 bg-green-400 text-gray-900 rounded-lg font-medium hover:bg-green-300 transition-colors flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Accept
                                            </button>

                                            <button
                                                onClick={() => rejectFriendRequest(request.id)}
                                                className="px-3 py-2 bg-red-400/20 text-red-400 rounded-lg font-medium hover:bg-red-400/30 transition-colors flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                <UserPlus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium mb-2">No pending requests</h3>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    You don't have any pending friend requests at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Sent Requests */}
                {activeSection === 'sent' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-teal-400" />
                            Sent Requests
                        </h2>

                        {sentRequests.length > 0 ? (
                            <div className="space-y-4">
                                {sentRequests.map((user) => (
                                    <div key={user.id} className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center border border-slate-600/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white">
                                                {user.first_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.first_name} {user.last_name}</p>
                                                <p className="text-sm text-gray-400">{user.email}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => cancelFriendRequest(user.id)}
                                            className="px-3 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-500 transition-colors flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel Request
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium mb-2">No sent requests</h3>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    You haven't sent any friend requests that are still pending.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}