import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEllipsisV,
  FaThumbtack,
} from "react-icons/fa"; // Add FaThumbtack
import { MdEmojiEmotions } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";
import PinMessageModal from "./PinMessageModal"; // Import PinMessageModal
import EditMessageModal from "./EditMessageModal"; // Import EditMessageModal

const ChatWindow = ({
  boardId, // Accept boardId as a prop
  pinnedMessages,
  setPinnedMessages, // Accept setPinnedMessages as a prop
  currentPinnedIndex,
  handlePreviousPinned,
  handleNextPinned,
  messages,
  messageRefs,
  currentUser,
  lastMessageRef,
  clickedMessageId,
  setClickedMessageId,
  showMessageOptions,
  setShowMessageOptions,
  pinMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  showReactionDropdown,
  setShowReactionDropdown,
  getSenderName,
  formatDate,
  formatTime,
  getSeenByNames,
  handleScroll,
  setMessages, // Add setMessages as a prop
  polls, // Accept polls as a prop
  votePoll, // Accept votePoll as a prop
  removePoll, // Accept removePoll as a prop
}) => {
  const [reactionModal, setReactionModal] = useState({
    isOpen: false,
    reactions: {},
  });
  const [pinModal, setPinModal] = useState({ isOpen: false, messageId: null }); // State for pin modal
  const [pinnedLogModal, setPinnedLogModal] = useState(false); // State for pinned log modal
  const [pinnedLog, setPinnedLog] = useState([]); // State for pinned messages log
  const [editModal, setEditModal] = useState({
    isOpen: false,
    messageId: null,
    text: "",
  }); // State for edit modal
  const [pollModal, setPollModal] = useState({ isOpen: false, poll: null }); // State for poll modal

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMessageOptions(null); // Close the dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPinnedMessages = async () => {
      try {
        if (!boardId) {
          console.error("boardId is not defined");
          return;
        }
        const response = await fetch(`https://new-server-brainaics.onrender.com/boards/${boardId}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setPinnedMessages(data.pinnedMessages || []); // Set pinned messages from the backend
      } catch (error) {
        console.error("Failed to fetch pinned messages:", error);
      }
    };

    fetchPinnedMessages();
  }, [boardId, setPinnedMessages]); // Fetch pinned messages on component mount or boardId change

  const handlePinMessage = (messageId) => {
    setPinModal({ isOpen: true, messageId }); // Open the pin modal
  };

  const confirmPinMessage = (duration) => {
    pinMessage(pinModal.messageId, duration); // Call the pinMessage function
    setPinModal({ isOpen: false, messageId: null }); // Close the modal
  };

  const handleEditMessage = (messageId, text) => {
    setEditModal({ isOpen: true, messageId, text }); // Open the edit modal
  };

  const confirmEditMessage = () => {
    if (editModal.text.trim()) {
      editMessage(editModal.messageId, editModal.text); // Call the editMessage function
      setEditModal({ isOpen: false, messageId: null, text: "" }); // Close the modal
    }
  };

  const removeReaction = async (messageId, emoji, userId) => {
    try {
      console.log(
        `Removing reaction: ${emoji} by user: ${userId} for message: ${messageId}`
      ); // Log the reaction being removed

      // Update the message in the messages state
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === messageId
            ? {
                ...msg,
                reactions: {
                  ...msg.reactions,
                  [emoji]: msg.reactions[emoji]?.filter((id) => id !== userId), // Ensure the user's ID is removed
                },
              }
            : msg
        )
      );

      // Call the backend to persist the change
      await reactToMessage(messageId, emoji); // Toggle the reaction in the backend

      setReactionModal({ isOpen: false, reactions: {} }); // Close the modal
    } catch (error) {
      console.error("Failed to remove reaction:", error);
    }
  };

  const unpinMessage = async (messageId) => {
    try {
      // Call the backend API to unpin the message
      const response = await fetch(
        `https://new-server-brainaics.onrender.com/boards/${boardId}/messages/${messageId}/unpin`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update the pinnedMessages state
        setPinnedMessages((prev) =>
          prev.filter((msg) => msg.messageId !== messageId)
        );

        // Remove the unpinned message from the pinned log
        setPinnedLog((prevLog) =>
          prevLog.filter((log) => log.messageId !== messageId)
        );
      } else {
        console.error("Failed to unpin message");
      }
    } catch (error) {
      console.error("Error unpinning message:", error);
    }
  };

  const formatExpiryTime = (expiry) => {
    const date = new Date(expiry);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <motion.div
        className="chat-window flex-1 rounded-lg overflow-y-scroll bg-gray-100 shadow-inner p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onScroll={handleScroll}
      >
        {pinnedMessages.length > 0 && (
          <motion.div
            className="sticky -top-11 bg-white shadow-md rounded-lg p-2 z-20 flex flex-col sm:flex-row items-center justify-between
 gap-1 border border-gray-200"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="text-primary hover:text-accent transition duration-200"
              onClick={handlePreviousPinned}
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-semibold  text-base sm:text-lg md:text-sm truncate">
                {pinnedMessages[currentPinnedIndex]?.text ||
                  "No pinned message"}
              </p>
              <p className="text-xs  mt-1">
                <span className="font-medium">Pinned by:</span>{" "}
                {getSenderName(pinnedMessages[currentPinnedIndex]?.pinnedBy) ||
                  "Unknown"}
              </p>
              <p className="text-xs">
                <span className="font-medium">Expires on:</span>{" "}
                {formatExpiryTime(
                  pinnedMessages[currentPinnedIndex]?.pinExpiry
                ) || "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="text-primary hover:text-accent transition duration-200"
                onClick={handleNextPinned}
              >
                <FaArrowRight className="text-2xl" />
              </button>
              <button
                className="text-red-500 hover:text-red-700 transition duration-200 flex items-center gap-1"
                onClick={() =>
                  unpinMessage(pinnedMessages[currentPinnedIndex]?.messageId)
                }
              >
                <FaThumbtack className="text-xl rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isSender = msg.senderId === currentUser._id;
            const previousMessage = messages[index - 1];
            const shouldShowDate =
              !previousMessage ||
              new Date(msg.timestamp).toDateString() !==
                new Date(previousMessage.timestamp).toDateString();

            return (
              <div
                key={msg.messageId}
                ref={(el) => (messageRefs.current[msg.messageId] = el)} // Assign ref
                onClick={() =>
                  setClickedMessageId(
                    clickedMessageId === msg.messageId ? null : msg.messageId
                  )
                }
              >
                {shouldShowDate && (
                  <p className="text-center text-gray-500 text-xs sm:text-sm mb-4">
                    {formatDate(msg.timestamp)}
                  </p>
                )}
                <div
                  className={`mb-6 flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {isSender && !msg.deletedBy && (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMessageOptions(
                              showMessageOptions === msg.messageId
                                ? null
                                : msg.messageId
                            );
                          }}
                        >
                          <FaEllipsisV />
                        </button>
                        {showMessageOptions === msg.messageId && (
                          <div className="absolute right-12 -top-10 w-40 bg-white shadow rounded-lg shadow-lg z-10">
                            <ul className="py-2">
                              <li
                                className="px-4 py-2 hover:shadow cursor-pointer"
                                onClick={() => handlePinMessage(msg.messageId)}
                              >
                                Pin
                              </li>
                              <li
                                className="px-4 py-2 hover:shadow cursor-pointer"
                                onClick={() =>
                                  handleEditMessage(msg.messageId, msg.text)
                                } // Open the edit modal
                              >
                                Edit
                              </li>
                              <li
                                className="px-4 py-2 hover:shadow cursor-pointer"
                                onClick={() => {
                                  deleteMessage(msg.messageId);
                                  setShowMessageOptions(null);
                                }}
                              >
                                Delete
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`relative max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg p-4 rounded-2xl shadow-lg ${
                        isSender
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p
                        className={`text-xs sm:text-sm font-semibold mb-2 ${
                          isSender ? "text-right" : "text-left"
                        }`}
                      >
                        {getSenderName(msg.senderId)}
                      </p>
                      {msg.deletedBy ? (
                        <p className="text-sm italic text-gray-200">
                          Message deleted by {msg.deletedBy} at{" "}
                          {formatTime(msg.deletedAt)}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm sm:text-base leading-relaxed">
                            {msg.text}
                          </p>
                          {!msg.deletedBy &&
                            msg.reactions &&
                            Object.keys(msg.reactions).length > 0 && (
                              <div
                                className={`absolute -bottom-4 ${
                                  isSender
                                    ? "px-2 py-1 left-1 bg-white"
                                    : "px-2 py-1 right-1 bg-gray-200"
                                } text-xs sm:text-sm mt-2 rounded-lg flex gap-2`}
                              >
                                {Object.entries(msg.reactions).map(
                                  ([emoji, users]) =>
                                    users.length > 0 && ( // Only show if there are reactions
                                      <div
                                        key={emoji}
                                        className={`flex items-center gap-1 cursor-pointer ${
                                          users.includes(currentUser._id)
                                            ? "bg-primary text-white px-2 py-1 rounded-lg"
                                            : ""
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReactionModal({
                                            isOpen: true,
                                            reactions: {
                                              emoji,
                                              users,
                                              messageId: msg.messageId,
                                            },
                                          });
                                        }}
                                      >
                                        <span>{emoji}</span>
                                        {users.length > 1 && (
                                          <span className="text-xs text-gray-400">
                                            {users.length}
                                          </span>
                                        )}
                                      </div>
                                    )
                                )}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                    {!isSender && !msg.deletedBy && (
                      <div className="relative">
                        <button
                          className="text-gray-500 hover:text-gray-700 text-lg"
                          onClick={() =>
                            setShowReactionDropdown(
                              showReactionDropdown === msg.messageId
                                ? null
                                : msg.messageId
                            )
                          }
                        >
                          <MdEmojiEmotions />
                        </button>
                        {showReactionDropdown === msg.messageId && (
                          <div className="absolute -top-18 bg-white rounded-lg shadow-lg z-10 p-2">
                            <div className="flex gap-2">
                              {["👍", "❤️", "😂", "😮", "😢", "😡"].map(
                                (emoji) => (
                                  <div
                                    key={emoji}
                                    className="cursor-pointer hover:shadow p-2 rounded text-2xl"
                                    onClick={async () => {
                                      try {
                                        await reactToMessage(
                                          msg.messageId,
                                          emoji
                                        ); // Add reaction to the database

                                        console.log(
                                          `User ${currentUser._id} reacted with ${emoji} to message ${msg.messageId}`
                                        ); // Log the reaction

                                        // Update the message in the messages state
                                        setMessages((prevMessages) => {
                                          const updatedMessages =
                                            prevMessages.map((msg) =>
                                              msg.messageId ===
                                              reactionModal.reactions.messageId
                                                ? {
                                                    ...msg,
                                                    reactions: {
                                                      ...Object.fromEntries(
                                                        Object.entries(
                                                          msg.reactions
                                                        ).map(
                                                          ([key, users]) => [
                                                            key,
                                                            users.filter(
                                                              (id) =>
                                                                id !==
                                                                currentUser._id
                                                            ), // Remove user's previous reaction
                                                          ]
                                                        )
                                                      ),
                                                      [emoji]: [
                                                        currentUser._id,
                                                      ], // Replace with the new reaction
                                                    },
                                                  }
                                                : msg
                                            );
                                          return updatedMessages;
                                        });

                                        setShowReactionDropdown(null); // Close the dropdown
                                      } catch (error) {
                                        console.error(
                                          "Failed to add reaction:",
                                          error
                                        );
                                      }
                                    }}
                                  >
                                    {emoji}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {clickedMessageId === msg.messageId && (
                  <>
                    <p
                      className={`text-xs sm:text-sm text-gray-400 mt-2 ${
                        isSender ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                    {msg.seenBy?.length > 0 && (
                      <p
                        className={`text-xs sm:text-sm text-gray-400 mt-1 ${
                          isSender ? "text-right" : "text-left"
                        }`}
                      >
                        Seen by: {getSeenByNames(msg.seenBy)}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center text-sm sm:text-base">
            No messages yet.
          </p>
        )}
      </motion.div>

      {/* Polls Section */}
      {polls.length > 0 && (
        <div className="sticky flex justify-between items-center bottom-0 bg-white shadow-md rounded-lg p-4 z-30">
          <h3 className="text-lg font-boldtext-primary">Active Polls</h3>
          {polls.map((poll) => (
            <div key={poll._id} className="poll-card">
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition"
                onClick={() => setPollModal({ isOpen: true, poll })} // Open the poll modal
              >
                Vote Now
              </button>
              <button
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
                onClick={() => removePoll(poll._id)} // Remove poll functionality
              >
                Remove Poll
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Poll Voting Modal */}
      {pollModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{pollModal.poll.question}</h3>
            <ul className="space-y-2">
              {pollModal.poll.options.map((option, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-200 p-2 rounded-lg hover:bg-gray-300 cursor-pointer"
                  onClick={() => {
                    votePoll(pollModal.poll._id, index); // Call votePoll function
                    setPollModal({ isOpen: false, poll: null }); // Close the modal
                  }}
                >
                  <span>{option.text}</span>
                  <span className="text-sm text-gray-500">
                    Votes: {option.votes.length}
                  </span>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              onClick={() => setPollModal({ isOpen: false, poll: null })} // Close the modal
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pinned Messages Log Modal */}
      {pinnedLogModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Pinned Messages Log</h3>
            <ul className="space-y-4">
              {pinnedLog.length > 0 ? (
                pinnedLog.map((log, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="text-sm text-gray-800">
                      <strong>Message:</strong>{" "}
                      {log.text || "No text available"}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Pinned By:</strong> {getSenderName(log.pinnedBy)}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Pinned At:</strong>{" "}
                      {new Date(log.pinnedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Pin Duration:</strong> {log.pinDuration}{" "}
                      {log.pinDuration === 1 ? "Day" : "Days"}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No pinned messages found.
                </p>
              )}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              onClick={() => setPinnedLogModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pin Modal */}
      <PinMessageModal
        isOpen={pinModal.isOpen}
        onClose={() => setPinModal({ isOpen: false, messageId: null })}
        onConfirm={confirmPinMessage}
      />

      {/* Edit Modal */}
      <EditMessageModal
        isOpen={editModal.isOpen}
        onClose={() =>
          setEditModal({ isOpen: false, messageId: null, text: "" })
        }
        onConfirm={confirmEditMessage}
        text={editModal.text}
        setText={(text) => setEditModal((prev) => ({ ...prev, text }))}
      />

      {reactionModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h3>Reactors</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() =>
                  setReactionModal({ isOpen: false, reactions: {} })
                }
              >
                <IoCloseCircleOutline className="text-2xl" />
              </button>
            </div>
            <div className="flex justify-between mt-4">
              <ul className="space-y-2 w-1/2">
                {reactionModal.reactions.users.map((userId) => {
                  const userName =
                    userId === currentUser._id ? "You" : getSenderName(userId);
                  return (
                    <li key={userId} className="text-gray-700 text-center">
                      {userName || "Unknown User"}
                    </li>
                  );
                })}
              </ul>
              <ul className="space-y-2 w-1/2">
                {reactionModal.reactions.users.map((userId) => (
                  <li
                    key={userId}
                    className="text-gray-700 text-center flex justify-between items-center"
                  >
                    <span>{reactionModal.reactions.emoji}</span>
                    {userId === currentUser._id && (
                      <button
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() =>
                          removeReaction(
                            reactionModal.reactions.messageId,
                            reactionModal.reactions.emoji,
                            userId
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
