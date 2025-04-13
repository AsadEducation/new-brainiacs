import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaVideo, FaEllipsisV } from "react-icons/fa";

const MessengerHeader = ({
  selectedBoard,
  showOptions,
  setShowOptions,
  createPoll,
}) => {
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false); // Close the dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-4 border-b border-gray-300"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-lg sm:text-xl font-bold text-primary mb-2 sm:mb-0"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {selectedBoard.name}
      </motion.h2>
      <motion.div
        className="flex items-center gap-2 sm:gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <button className="text-primary hover:text-accent transition duration-200">
          <FaPhoneAlt className="text-xl sm:text-2xl" />
        </button>
        <button className="text-primary hover:text-accent transition duration-200">
          <FaVideo className="text-xl sm:text-2xl" />
        </button>
        <div className="relative" ref={optionsRef}>
          <button
            className="text-primary hover:text-accent transition duration-200"
            onClick={() => setShowOptions(!showOptions)}
          >
            <FaEllipsisV className="text-xl sm:text-2xl" />
          </button>
          {showOptions && (
            <motion.div
              className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200"
                  onClick={createPoll}
                >
                  Create Poll
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200">
                  Set Nickname
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200">
                  Add Members
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200">
                  Leave Group
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200">
                  Delete Group
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MessengerHeader;
