
import "./globals.css";
import VerticalBar from "./VerticalBar/page";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
        
      >
        

        {children}

      </body>
    </html>
  );
}
