import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import discussionService from '../services/discussionService';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const DiscussionPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // States
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Form states
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  const [newReply, setNewReply] = useState({
    content: '',
  });

  const categories = [
    { value: 'general', label: 'General Discussion', icon: '💬' },
    { value: 'doubt', label: 'Ask a Question', icon: '❓' },
    { value: 'resource', label: 'Share Resource', icon: '📚' },
    { value: 'announcement', label: 'Announcement', icon: '📢' },
    { value: 'project', label: 'Project Help', icon: '🛠️' },
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, filterCategory, sortBy]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        sort: sortBy,
      };
      const data = await discussionService.getCourseDiscussions(courseId, params);
      setDiscussions(data);
    } catch (error) {
      showNotification('Failed to load discussions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();

    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    try {
      setPosting(true);
      await discussionService.createDiscussion(courseId, newDiscussion);
      showNotification('Discussion created successfully!', 'success');
      setNewDiscussion({ title: '', content: '', category: 'general' });
      setShowCreateModal(false);
      fetchDiscussions();
    } catch (error) {
      showNotification('Failed to create discussion', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleReplyToDiscussion = async (e) => {
    e.preventDefault();

    if (!newReply.content.trim()) {
      showNotification('Reply cannot be empty', 'warning');
      return;
    }

    try {
      setPosting(true);
      await discussionService.replyToDiscussion(
        courseId,
        selectedDiscussion._id,
        newReply
      );
      showNotification('Reply posted successfully!', 'success');
      setNewReply({ content: '' });
      setShowReplyModal(false);
      // Refresh the discussion
      const updated = await discussionService.getDiscussionDetail(
        courseId,
        selectedDiscussion._id
      );
      setSelectedDiscussion(updated);
    } catch (error) {
      showNotification('Failed to post reply', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (discussionId) => {
    try {
      await discussionService.upvoteDiscussion(courseId, discussionId);
      fetchDiscussions();
      showNotification('Upvoted!', 'success');
    } catch (error) {
      showNotification('Failed to upvote', 'error');
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) {
      return;
    }

    try {
      await discussionService.deleteDiscussion(courseId, discussionId);
      showNotification('Discussion deleted', 'success');
      setSelectedDiscussion(null);
      fetchDiscussions();
    } catch (error) {
      showNotification('Failed to delete discussion', 'error');
    }
  };

  const filteredDiscussions = discussions.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryInfo = (category) => {
    return categories.find((c) => c.value === category);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Course Discussion Forum
          </h1>
          <p className="text-gray-600">
            Connect with other students and instructors
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left: Discussions List */}
          <div className="col-span-2">
            {/* Controls */}
            <Card className="mb-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="primary"
                  >
                    + New Discussion
                  </Button>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="unanswered">Unanswered</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Discussions List */}
            {filteredDiscussions.length > 0 ? (
              <div className="space-y-4">
                {filteredDiscussions.map((discussion) => {
                  const categoryInfo = getCategoryInfo(discussion.category);
                  return (
                    <Card
                      key={discussion._id}
                      className={`cursor-pointer transition hover:shadow-lg ${
                        selectedDiscussion?._id === discussion._id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : ''
                      }`}
                      onClick={() => setSelectedDiscussion(discussion)}
                    >
                      <div className="flex gap-4">
                        <div className="text-4xl">{categoryInfo?.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">
                              {discussion.title}
                            </h3>
                            {discussion.isPinned && (
                              <span className="text-yellow-500 text-xl">📌</span>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {discussion.content}
                          </p>

                          <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
                            <span>👤 {discussion.authorName}</span>
                            <span>💬 {discussion.repliesCount || 0} replies</span>
                            <span>👍 {discussion.upvotes || 0} upvotes</span>
                            <span>👁️ {discussion.views || 0} views</span>
                            <span>
                              {new Date(discussion.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-8">
                <p className="text-gray-600 mb-4">No discussions found</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                >
                  Start a New Discussion
                </Button>
              </Card>
            )}
          </div>

          {/* Right: Discussion Detail */}
          <div>
            {selectedDiscussion ? (
              <Card className="sticky top-20">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary">
                        {getCategoryInfo(selectedDiscussion.category)?.label}
                      </Badge>
                      {selectedDiscussion.isPinned && (
                        <span className="text-yellow-500">📌 Pinned</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDiscussion.title}
                    </h2>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Posted by <span className="font-semibold">{selectedDiscussion.authorName}</span>
                    </p>
                    <p className="text-gray-700">{selectedDiscussion.content}</p>
                  </div>

                  {selectedDiscussion.replies && selectedDiscussion.replies.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">
                        Replies ({selectedDiscussion.replies.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedDiscussion.replies.slice(0, 3).map((reply, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded text-sm"
                          >
                            <p className="font-semibold text-gray-900">
                              {reply.authorName}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                        {selectedDiscussion.replies.length > 3 && (
                          <p className="text-blue-600 text-sm font-semibold cursor-pointer">
                            View all {selectedDiscussion.replies.length} replies →
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpvote(selectedDiscussion._id)}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      👍 Upvote ({selectedDiscussion.upvotes || 0})
                    </Button>
                    <Button
                      onClick={() => setShowReplyModal(true)}
                      variant="primary"
                      className="flex-1 text-sm"
                    >
                      Reply
                    </Button>
                  </div>

                  {user && user._id === selectedDiscussion.authorId && (
                    <Button
                      onClick={() => handleDeleteDiscussion(selectedDiscussion._id)}
                      variant="danger"
                      className="w-full text-sm"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="text-center py-8">
                <p className="text-gray-600">Select a discussion to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Start a New Discussion"
      >
        <form onSubmit={handleCreateDiscussion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={newDiscussion.category}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Title"
            type="text"
            value={newDiscussion.title}
            onChange={(e) =>
              setNewDiscussion({ ...newDiscussion, title: e.target.value })
            }
            placeholder="What's your question or topic?"
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newDiscussion.content}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, content: e.target.value })
              }
              placeholder="Provide details about your topic..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => setShowCreateModal(false)}
              variant="outline"
              disabled={posting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={posting}
            >
              Post Discussion
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Reply to Discussion"
      >
        <form onSubmit={handleReplyToDiscussion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Reply</label>
            <textarea
              value={newReply.content}
              onChange={(e) =>
                setNewReply({ content: e.target.value })
              }
              placeholder="Share your thoughts..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => setShowReplyModal(false)}
              variant="outline"
              disabled={posting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={posting}
            >
              Post Reply
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiscussionPage;
