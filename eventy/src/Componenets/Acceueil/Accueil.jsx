import React, { useState, useEffect } from "react";
import "./Accueil.css";
import { fetchEvents } from '../Redux/Event/eventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSaveEvent, toggleInterestedEvent } from '../Redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const categories = [
  { 
    icon: "💼", 
    label: "Business",
    background: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🍽️", 
    label: "Resto",
    background: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🏨", 
    label: "Hotels",
    background: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🏀", 
    label: "Sports",
    background: "https://images.unsplash.com/photo-1543357486-c250b47b20ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🎉", 
    label: "Party",
    background: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "⛺", 
    label: "Camping",
    background: "https://images.unsplash.com/photo-1487730116645-74489c95b41b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🛍️", 
    label: "Promotion",
    background: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🎮", 
    label: "Gaming",
    background: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🎬", 
    label: "Cinema",
    background: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🏖️", 
    label: "Beach",
    background: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    icon: "🎯", 
    label: "Clubs",
    background: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  }
];

const initialEvents = [
  {
    title: "Business Networking",
    date: "April 25, 2024",
    time: "6:00 PM",
    location: "Grand Hotel, New York",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Business"
  },
  {
    title: "Workshop on Workflow",
    date: "April 27, 2024",
    time: "10:00 AM",
    location: "Grand Hotel, Chicago",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Business"
  },
  {
    title: "Chess Club Meetup",
    date: "April 30, 2024",
    time: "4:00 PM",
    location: "Central Library, Boston",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlcLn6QUg1kdV4Sdm07Jix0XJGBb_eDwdubcU-srHt3h7mjBGzRg&s=10&ec=72940544",
    category: "Clubs"
  },
  {
    title: "Marketing Presentation",
    date: "May 18, 2024",
    time: "2:30 PM",
    location: "Quest Plaza, San Francisco",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    category: "Business"
  }
];

function Accueil() {
    const dispatch = useDispatch();
  const { loading, error, events } = useSelector((state) => state.event);
  const { user } = useSelector((state) => state.auth);
  const fetchedEvents = events?.data?.events || [];

  // Initialize event states with saved/interested status from Redux
  const [eventStates, setEventStates] = useState(
    fetchedEvents.map((event) => ({
      showComments: false,
      comment: "",
      commentsList: [],
      interested: user?.interestedEvents?.includes(event._id) || false,
      saved: user?.savedEvents?.includes(event._id) || false
    }))
  );
const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

 useEffect(() => {
  const newStates = fetchedEvents.map((event) => ({
    showComments: false,
    comment: "",
    commentsList: [],
    interested: user?.interestedEvents?.includes(event._id) || false,
    saved: user?.savedEvents?.includes(event._id) || false
  }));

  // Only update state if it's different
  const newStatesJSON = JSON.stringify(newStates);
  const currentStatesJSON = JSON.stringify(eventStates);

  if (newStatesJSON !== currentStatesJSON) {
    setEventStates(newStates);
  }
}, [fetchedEvents, user]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleComments = (index) => {
    const newStates = [...eventStates];
    newStates[index].showComments = !newStates[index].showComments;
    setEventStates(newStates);
  };

  const handleCommentChange = (index, value) => {
    const newStates = [...eventStates];
    newStates[index].comment = value;
    setEventStates(newStates);
  };

  const submitComment = (index) => {
    const newStates = [...eventStates];
    if (newStates[index].comment.trim() !== "") {
      newStates[index].commentsList.push({
        text: newStates[index].comment,
        likes: 0,
        showReply: false,
        reply: "",
        replies: [],
        timestamp: new Date().toLocaleString()
      });
      newStates[index].comment = "";
      setEventStates(newStates);
    }
  };

  const toggleReply = (eventIndex, commentIndex) => {
    const newStates = [...eventStates];
    const comment = newStates[eventIndex].commentsList[commentIndex];
    comment.showReply = !comment.showReply;
    setEventStates(newStates);
  };

  const handleReplyChange = (eventIndex, commentIndex, value) => {
    const newStates = [...eventStates];
    newStates[eventIndex].commentsList[commentIndex].reply = value;
    setEventStates(newStates);
  };

  const submitReply = (eventIndex, commentIndex) => {
    const newStates = [...eventStates];
    const comment = newStates[eventIndex].commentsList[commentIndex];
    if (comment.reply.trim() !== "") {
      comment.replies.push({
        text: comment.reply,
        timestamp: new Date().toLocaleString()
      });
      comment.reply = "";
      setEventStates(newStates);
    }
  };

  const likeComment = (eventIndex, commentIndex) => {
    const newStates = [...eventStates];
    newStates[eventIndex].commentsList[commentIndex].likes += 1;
    setEventStates(newStates);
  };
const toggleInterested = async (index) => {
  try {
    const eventId = fetchedEvents[index]?._id;
    if (!eventId) return;

    // Optimistic update
    const newStates = [...eventStates];
    newStates[index].interested = !newStates[index].interested;
    setEventStates(newStates);

    await dispatch(toggleInterestedEvent(eventId)).unwrap();
  } catch (err) {
    console.error('Failed to toggle interest:', err);
    // Revert on error
    const revertStates = [...eventStates];
    revertStates[index].interested = !revertStates[index].interested;
    setEventStates(revertStates);
  }
};

const toggleSaved = async (index) => {
  try {
    const eventId = fetchedEvents[index]?._id;
    if (!eventId) return;

    // Optimistic update
    const newStates = [...eventStates];
    newStates[index].saved = !newStates[index].saved;
    setEventStates(newStates);

    await dispatch(toggleSaveEvent(eventId)).unwrap();
  } catch (err) {
    console.error('Failed to toggle save:', err);
    // Revert on error
    const revertStates = [...eventStates];
    revertStates[index].saved = !revertStates[index].saved;
    setEventStates(revertStates);
  }
};

  const filteredEvents = fetchedEvents.filter((event) => {
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return (
    <div className="app">
      <header className="header">
        <div className="categories-scroll">
          <div 
            className={`category ${activeCategory === "All" ? "active" : ""}`}
            onClick={() => setActiveCategory("All")}
          >
            <div className="category-background" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80")' }}></div>
            <span>🌟</span>
            <p>All</p>
          </div>
          {categories.map((cat) => (
            <div 
              className={`category ${activeCategory === cat.label ? "active" : ""}`} 
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
            >
              <div className="category-background" style={{ backgroundImage: `url(${cat.background})` }}></div>
              <span>{cat.icon}</span>
              <p>{cat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="events-container">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
 <div className="event-card" key={index}>
  <div className="event-image-container">
    {/* You might want to add an image field to your DB or use a placeholder */}
<img
  src={event.image}
  alt={event.title}
  onClick={() => navigate(`/event/${event._id}`, { state: { event } })}
/>   <button 
  className={`save-button ${eventStates[index]?.saved ? "saved" : ""}`}
  onClick={() => toggleSaved(index)}
>
  {eventStates[index]?.saved ? "✓ Saved" : "+ Save"}
</button>
    <div className="event-category">{event.category}</div>
  </div>
  
  <div className="event-details">
    <div className="event-header">
      <h3>{event.title}</h3>
      <div className="event-meta">
        <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
        <span>⏰ {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        {event.endDate && (
          <span> - {new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        )}
      </div>
      <p className="event-location">📍 {event.address}</p>
      <p className="event-summary">{event.summary}</p>
      {event.description && (
        <p className="event-description">{event.description}</p>
      )}
    </div>
    
    <div className="event-actions">
      <button 
        className={`interest-button ${eventStates[index]?.interested ? "interested" : ""}`}
        onClick={() => toggleInterested(index)}
      >
        {eventStates[index]?.interested ? "✓ Going" : "+ Interested"}
      </button>
      
      <button
        className="comments-button"
        onClick={() => toggleComments(index)}
      >
        💬 {eventStates[index]?.commentsList?.length || 0}
      </button>

      {event.isFree ? (
        <span className="free-badge">Free</span>
      ) : (
        <span className="price-badge">Paid Event</span>
      )}
    </div>

    {eventStates[index]?.showComments && (
      <div className="comments-section">
        <div className="comment-input">
          <textarea
            placeholder="Ask something or share your thoughts..."
            value={eventStates[index].comment}
            onChange={(e) => handleCommentChange(index, e.target.value)}
          />
          <button 
            className="send-button"
            onClick={() => submitComment(index)}
            disabled={!eventStates[index].comment.trim()}
          >
            Post
          </button>
        </div>

        <div className="comments-list">
          {eventStates[index]?.commentsList?.length > 0 ? (
            eventStates[index].commentsList.map((comment, cIndex) => (
              <div key={cIndex} className="comment-item">
                <div className="comment-header">
                  <span className="comment-user">User</span>
                  <span className="comment-time">{comment.timestamp}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
                
                <div className="comment-actions">
                  <button 
                    className="like-button"
                    onClick={() => likeComment(index, cIndex)}
                  >
                    👍 {comment.likes > 0 && comment.likes}
                  </button>
                  <button 
                    className="reply-button"
                    onClick={() => toggleReply(index, cIndex)}
                  >
                    {comment.showReply ? "Cancel" : "Reply"}
                  </button>
                </div>

                {comment.showReply && (
                  <div className="reply-input">
                    <input
                      placeholder="Write a reply..."
                      value={comment.reply}
                      onChange={(e) =>
                        handleReplyChange(index, cIndex, e.target.value)
                      }
                    />
                    <button 
                      className="send-button"
                      onClick={() => submitReply(index, cIndex)}
                      disabled={!comment.reply.trim()}
                    >
                      Send
                    </button>
                  </div>
                )}

                {comment.replies?.length > 0 && (
                  <div className="replies-list">
                    {comment.replies.map((reply, rIndex) => (
                      <div key={rIndex} className="reply-item">
                        <div className="reply-header">
                          <span className="reply-user">User</span>
                          <span className="reply-time">{reply.timestamp}</span>
                        </div>
                        <p className="reply-text">↪️ {reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    )}
  </div>
</div>
          ))
        ) : (
          <div className="no-events">
            <p>No events found matching your criteria.</p>
            <button onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}>
              Reset filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Accueil;