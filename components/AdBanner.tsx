import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <div className="ad-banner">
      {/* Ad content will be inserted here by the ad network */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4763427752391920"
        data-ad-slot="1026158741"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
  );
};

export default AdBanner;

