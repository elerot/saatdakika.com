import { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
     style={{display:"block"}}
     data-ad-client="ca-pub-4763427752391920"
     data-ad-slot="1026158741"
     data-ad-format="auto"
     data-full-width-responsive="true">
     </ins>
  );
};
export default AdBanner;