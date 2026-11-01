import React from "react";
import Script from "next/script";

const Page = () => {
  return (
    <div>
      <Script
        src="http://localhost:3000/widget.js"
        data-id="2fb82980-79a7-44d6-85cb-f289175c2d99"
        strategy="afterInteractive"
      />
    </div>
  );
};

export default Page;