import React, { useEffect } from 'react';

export default function AdBannerYndx(key) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.yaContextCb) {
      window.yaContextCb.push(() => {
        Ya.Context.AdvManager.render({
          blockId: "R-A-13371244-1",
          renderTo: "yandex_rtb_R-A-13371244-1",
        });
      });
    }
  }, []); // Bu effect sadece bir kez çalışır (component mount edildiğinde)

  return (
    <div key={key} id="yandex_rtb_R-A-13371244-1"></div>
  );
};

