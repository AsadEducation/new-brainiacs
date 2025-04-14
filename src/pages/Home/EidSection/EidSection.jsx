import { motion } from "framer-motion";
import Countdown from "react-countdown";
import confetti from "canvas-confetti";
import { useRef } from "react";
import "./EidSection.css"; // CSS for stars

const EidSection = () => {
  const eidDate = new Date("2025-04-10T00:00:00");

  const handleClaim = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
          We had an amazing offer during Eid! Stay tuned for more exciting updates.
        </p>
      );
    } else {
      return (
        <span>
          Only {days} days {hours} hrs {minutes} mins {seconds} secs remaining
        </span>
      );
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
      viewport={{ once: true }}
      className="relative overflow-hidden bg-green-50 dark:bg-gray-900 py-10 px-4 md:px-20 text-center shadow-lg my-15"
    >
      {/* Floating Stars */}
      {[...Array(30)].map((_, index) => (
        <div
          key={index}
          className="floating-star twinkling-star"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}px`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      <h2 className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400 mb-4">
        Eid-ul-Fitr Greetings
      </h2>

      <p className="text-base sm:text-lg md:text-xl mb-6 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
        On behalf of the Brainiacs team, we wish you an advance Eid Mubarak.
        <br />
        “This Eid, Brainiacs users will enjoy a{" "}
        <span className="font-semibold text-green-600 dark:text-green-400">
          3-day free premium trial!
        </span>
        ”
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-xl mx-auto relative z-10">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Expected Eid Date:{" "}
          <span className="text-green-600 dark:text-green-400">April 10, 2025</span>
        </h3>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3">
          Time remaining until Eid:
        </p>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-lg sm:text-2xl text-green-700 dark:text-green-300 font-bold"
        >
          <Countdown date={eidDate} renderer={renderer} />
        </motion.div>

        <button
          onClick={handleClaim}
          className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
        >
          Claim Free Premium
        </button>
      </div>
    </motion.section>
  );
};

export default EidSection;
