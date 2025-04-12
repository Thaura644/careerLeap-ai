import WaitlistPopup from "@/components/WaitlistPopup";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (<>
 
  <Component {...pageProps} />
  <WaitlistPopup/>
  </>
  );
}
