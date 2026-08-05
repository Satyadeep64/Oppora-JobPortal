import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaShareAlt,
  FaPaperPlane,
  FaLock,
  FaFilter,
  FaUserGraduate,
  FaClock,
  FaTimes
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import "./CandidateBlogs.css";

const API_BASE = `${API_BASE_URL}/api/Blog`;

const CATEGORIES = [
  "All",
  "Interview Experience",
  "Career Advice",
  "Technical Tips",
  "System Design",
  "Resume Advice"
];

const CandidateBlogs = () => {
  const navigate = useNavigate();

  // Authentication & Role Check
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Candidate";
  const theme = localStorage.getItem("theme") || "light";

  const isCandidate = role === "Candidate";

  // State Management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "upvotes", "comments"

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Interview Experience");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Expanded Comments & Comment Inputs
  const [expandedComments, setExpandedComments] = useState({}); // { postId: boolean }
  const [commentInputs, setCommentInputs] = useState({}); // { postId: string }

  // Local Vote Tracking: { postId: 'up' | 'down' | null }
  const [userVotes, setUserVotes] = useState({});

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (isCandidate) {
      fetchPosts();
    }
  }, [isCandidate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_BASE);
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError("Failed to load blog posts. Please check back later.");
    } finally {
      setLoading(false);
    }
  };

  // Create Post Handler
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast("Please fill in both title and content!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: userId ? parseInt(userId) : 0,
        authorName: userName,
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim()
      };

      const res = await axios.post(API_BASE, payload);
      setPosts([res.data, ...posts]);
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("Interview Experience");
      showToast("🎉 Your blog post has been published successfully!");
    } catch (err) {
      console.error("Error creating post:", err);
      showToast("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Post Handler
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${postId}`);
      setPosts(posts.filter((p) => p.id !== postId));
      showToast("🗑️ Blog post deleted.");
    } catch (err) {
      console.error("Error deleting post:", err);
      showToast("Failed to delete post.");
    }
  };

  // Vote (Like / Dislike) Handler
  const handleVote = async (postId, type) => {
    const currentVote = userVotes[postId]; // 'up', 'down', or undefined

    let voteTypeToSend = type === "up" ? "upvote" : "downvote";
    let updatedUserVote = type;

    // Handle toggling existing vote
    if (currentVote === type) {
      voteTypeToSend = type === "up" ? "remove_upvote" : "remove_downvote";
      updatedUserVote = null;
    }

    // Update local state optimistically
    setUserVotes((prev) => ({ ...prev, [postId]: updatedUserVote }));

    try {
      const res = await axios.post(`${API_BASE}/${postId}/vote`, {
        voteType: voteTypeToSend
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              upvotes: res.data.upvotes,
              downvotes: res.data.downvotes
            };
          }
          return post;
        })
      );

      // If switched from downvote to upvote or vice versa, adjust the opposing count backend call if needed
      if (currentVote && currentVote !== type && updatedUserVote !== null) {
        const secondaryVoteType = currentVote === "up" ? "remove_upvote" : "remove_downvote";
        const secondRes = await axios.post(`${API_BASE}/${postId}/vote`, {
          voteType: secondaryVoteType
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                upvotes: secondRes.data.upvotes,
                downvotes: secondRes.data.downvotes
              };
            }
            return post;
          })
        );
      }
    } catch (err) {
      console.error("Error voting on post:", err);
      showToast("Failed to submit vote.");
    }
  };

  // Add Comment Handler
  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const payload = {
        userId: userId ? parseInt(userId) : 0,
        authorName: userName,
        commentText: commentText.trim()
      };

      const res = await axios.post(`${API_BASE}/${postId}/comment`, payload);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), res.data]
            };
          }
          return post;
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      showToast("💬 Comment added!");
    } catch (err) {
      console.error("Error adding comment:", err);
      showToast("Failed to add comment.");
    }
  };

  // Toggle Comment Collapse
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Copy Post Link
  const handleShare = (postId) => {
    const url = `${window.location.origin}/blogs#post-${postId}`;
    navigator.clipboard.writeText(url);
    showToast("🔗 Post link copied to clipboard!");
  };

  // Format Relative Time
  const formatTime = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  // Filter & Sort Logic
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "upvotes") {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (sortBy === "comments") {
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      }
      // default: newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // RESTRICTED ACCESS SCREEN FOR RECRUITERS
  if (!isCandidate) {
    return (
      <div className={`candidate-blogs-container ${theme === "dark" ? "dark" : ""}`}>
        <div className="restricted-card">
          <div className="restricted-icon">
            <FaLock />
          </div>
          <h2>Candidate Access Only</h2>
          <p>
            The Candidate Blogs community is exclusively available for candidates to share
            interview experiences, technical prep, and career advice.
          </p>
          <div className="restricted-actions">
            <button className="btn-primary" onClick={() => navigate("/home")}>
              Go to Home
            </button>
            {role === "Recruiter" && (
              <button className="btn-secondary" onClick={() => navigate("/dashboard/recruiter")}>
                Recruiter Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`candidate-blogs-container ${theme === "dark" ? "dark" : ""}`}>
      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* Hero Header Section */}
      <div className="blogs-hero">
        <div className="hero-badge">
          <FaUserGraduate /> Candidate Community
        </div>
        <h1>Candidate Knowledge & Interview Hub</h1>
        <p>
          Share your real technical interview rounds, system design insights, and career growth stories with fellow job seekers.
        </p>

        <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Post Your Story
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="blogs-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs, topics, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="sort-box">
          <FaFilter className="filter-icon" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="upvotes">Most Liked</option>
            <option value="comments">Most Discussed</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Feed */}
      {loading ? (
        <div className="blogs-loading">
          <div className="spinner"></div>
          <p>Loading candidate blogs...</p>
        </div>
      ) : error ? (
        <div className="blogs-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchPosts}>
            Retry
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-blogs">
          <h3>No blogs found</h3>
          <p>Be the first candidate to publish an article in this category!</p>
          <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Create Post
          </button>
        </div>
      ) : (
        <div className="blogs-feed">
          {filteredPosts.map((post) => {
            const isAuthor =
              (userId && post.userId === parseInt(userId)) ||
              (post.authorName && post.authorName.toLowerCase() === userName.toLowerCase());

            const userVote = userVotes[post.id];
            const isCommentsExpanded = expandedComments[post.id];

            return (
              <article key={post.id} id={`post-${post.id}`} className="blog-card">
                {/* Card Header */}
                <div className="blog-card-header">
                  <div className="author-info">
                    <div className="author-avatar">
                      {post.authorImage ? (
                        <img src={post.authorImage} alt={post.authorName} />
                      ) : (
                        <span>{post.authorName ? post.authorName.charAt(0).toUpperCase() : "C"}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="author-name">{post.authorName || "Candidate"}</h4>
                      <span className="post-date">
                        <FaClock /> {formatTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="header-right">
                    <span className="category-badge">{post.category}</span>
                    {isAuthor && (
                      <button
                        className="delete-post-btn"
                        title="Delete your post"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Title & Content */}
                <div className="blog-card-body">
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-content">{post.content}</p>
                </div>

                {/* Card Action Bar */}
                <div className="blog-card-actions">
                  <div className="vote-group">
                    <button
                      className={`vote-btn upvote ${userVote === "up" ? "voted-up" : ""}`}
                      onClick={() => handleVote(post.id, "up")}
                      title="Like / Upvote"
                    >
                      <FaThumbsUp />
                      <span>{post.upvotes}</span>
                    </button>

                    <button
                      className={`vote-btn downvote ${userVote === "down" ? "voted-down" : ""}`}
                      onClick={() => handleVote(post.id, "down")}
                      title="Dislike / Downvote"
                    >
                      <FaThumbsDown />
                      <span>{post.downvotes}</span>
                    </button>
                  </div>

                  <div className="secondary-actions">
                    <button
                      className={`action-btn comment-btn ${isCommentsExpanded ? "active" : ""}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <FaComment />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>

                    <button className="action-btn share-btn" onClick={() => handleShare(post.id)}>
                      <FaShareAlt />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Comments Section */}
                {isCommentsExpanded && (
                  <div className="comments-section">
                    <h4>Comments ({post.comments?.length || 0})</h4>

                    <div className="add-comment-box">
                      <input
                        type="text"
                        placeholder="Write a constructive response..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                      />
                      <button
                        className="send-comment-btn"
                        onClick={() => handleAddComment(post.id)}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>

                    <div className="comments-list">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment, index) => (
                          <div key={comment.id || index} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-author">{comment.authorName}</span>
                              <span className="comment-time">
                                {formatTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="comment-text">{comment.commentText}</p>
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">No comments yet. Start the conversation!</p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* CREATE BLOG POST MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Candidate Blog Post</h3>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="modal-body">
              <div className="form-group">
                <label>Article Title *</label>
                <input
                  type="text"
                  placeholder="e.g., How I Solved Google's Coding Round in 45 Mins"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Post Content *</label>
                <textarea
                  rows="7"
                  placeholder="Share details about the questions asked, techniques used, prep resources, or key learnings..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateBlogs;
