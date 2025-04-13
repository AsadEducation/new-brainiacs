import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaEllipsisV } from "react-icons/fa";
import { MdEmojiEmotions } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";

const ChatWindow = ({
  pinnedMessages,
  currentPinnedIndex,
  handlePreviousPinned,
  handleNextPinned,
  messages,
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
}) => {
  const [reactionModal, setReactionModal] = useState({
    isOpen: false,
    reactions: {},
  });

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

  const removeReaction = async (messageId, emoji, userId) => {
    try {
      console.log(`Removing reaction: ${emoji} by user: ${userId} for message: ${messageId}`); // Log the reaction being removed

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
            className="sticky -top-10 bg-yellow-100 px-4 py-1 rounded-lg shadow z-10 flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="text-primary hover:text-accent transition duration-200"
              onClick={handlePreviousPinned}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div className="text-center">
              <p className="font-bold text-gray-800 text-sm sm:text-base md:text-lg">
                {pinnedMessages[currentPinnedIndex]?.text}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Pinned by:{" "}
                {getSenderName(pinnedMessages[currentPinnedIndex]?.pinnedBy)}
              </p>
            </div>
            <button
              className="text-primary hover:text-accent transition duration-200"
              onClick={handleNextPinned}
            >
              <FaArrowRight className="text-xl" />
            </button>
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
                ref={index === messages.length - 1 ? lastMessageRef : null}
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
                                onClick={() => {
                                  const duration = parseInt(
                                    prompt(
                                      "Enter pin duration (1, 3, 7, or 15 days):",
                                      "1"
                                    ),
                                    10
                                  );
                                  if ([1, 3, 7, 15].includes(duration)) {
                                    pinMessage(msg.messageId, duration);
                                  } else {
                                    alert("Invalid duration");
                                  }
                                  setShowMessageOptions(null);
                                }}
                              >
                                Pin
                              </li>
                              <li
                                className="px-4 py-2 hover:shadow cursor-pointer"
                                onClick={() => {
                                  const newText = prompt(
                                    "Edit your message:",
                                    msg.text
                                  );
                                  if (newText) {
                                    editMessage(msg.messageId, newText);
                                  }
                                  setShowMessageOptions(null);
                                }}
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
                        <p className="text-sm italic text-gray-500">
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
                                className={`absolute -bottom-4  ${
                                  isSender ? "px-2 py-1 left-1 bg-white" : "left-10"
                                } text-xs sm:text-sm mt-2 rounded-lg flex gap-2`}
                              >
                                {Object.entries(msg.reactions).map(
                                  ([emoji, users]) =>
                                    users.length > 0 && ( // Only show if there are reactions
                                      <div
                                        key={emoji}
                                        className={`flex items-center gap-1 cursor-pointer ${
                                          users.includes(currentUser._id)
                                            ? "bg-primary text-white px-2 py-1 rounded-lg absolute bottom-0 left-13"
                                            : ""
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReactionModal({
                                            isOpen: true,
                                            reactions: { emoji, users, messageId: msg.messageId },
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
                                        await reactToMessage(msg.messageId, emoji); // Add reaction to the database

                                        console.log(`User ${currentUser._id} reacted with ${emoji} to message ${msg.messageId}`); // Log the reaction

                                        // Update the message in the messages state
                                        setMessages((prevMessages) => {
                                          const updatedMessages = prevMessages.map((msg) =>
                                            msg.messageId === reactionModal.reactions.messageId
                                              ? {
                                                  ...msg,
                                                  reactions: {
                                                    ...Object.fromEntries(
                                                      Object.entries(msg.reactions).map(([key, users]) => [
                                                        key,
                                                        users.filter((id) => id !== currentUser._id), // Remove user's previous reaction
                                                      ])
                                                    ),
                                                    [emoji]: [currentUser._id], // Replace with the new reaction
                                                  },
                                                }
                                              : msg
                                          );
                                          return updatedMessages;
                                        });

                                        setShowReactionDropdown(null); // Close the dropdown
                                      } catch (error) {
                                        console.error("Failed to add reaction:", error);
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
