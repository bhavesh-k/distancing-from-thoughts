import "./styles/normalize.css";
import "./styles/mvp.css";
import "./styles/globals.css";

export const metadata = {
  title: "Distance from Thoughts",
  description: "A mental wellbeing app to help you create distance from persistent negative thoughts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
