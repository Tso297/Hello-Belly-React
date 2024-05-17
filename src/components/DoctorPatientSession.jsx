import React, { useEffect } from 'react';
import ZoomMtg from "@zoomus/websdk/dist/zoomus-websdk-embedded.umd.min.js";

const DoctorPatientSession = ({ meetingNumber, userName, userEmail }) => {
  useEffect(() => {
    const initZoom = async () => {
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.1.1/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareJssdk();

      try {
        const response = await fetch(`http://localhost:5000/api/zoom_token?meeting_number=${meetingNumber}&role=0`);
        const data = await response.json();

        ZoomMtg.init({
          leaveUrl: 'http://localhost:5000',
          isSupportAV: true,
          success: () => {
            console.log('Zoom SDK initialized successfully');
            ZoomMtg.join({
              signature: data.signature,
              meetingNumber,
              userName,
              apiKey: 'OAADD7FsTk6Wi0FG6nhvwg',
              userEmail,
              passWord: '',
              success: (success) => {
                console.log('Join meeting success', success);
              },
              error: (error) => {
                console.error('Join meeting error', error);
              }
            });
          },
          error: (error) => {
            console.error('Zoom SDK initialization error', error);
          }
        });
      } catch (error) {
        console.error('Error fetching Zoom token', error);
      }
    };

    initZoom();
  }, [meetingNumber, userName, userEmail]);

  return (
    <div>
      <h1>Doctor-Patient Session</h1>
      <div id="zmmtg-root"></div>
    </div>
  );
};

export default DoctorPatientSession;