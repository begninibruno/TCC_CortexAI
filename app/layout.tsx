
import "./globals.css";
import VerticalBar from "./VerticalBar/page";
// import { Header } from '../.next/components/header/index'

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

        {/* <Header></Header> */}
        <VerticalBar>
        {children}
        </VerticalBar>
      </body>
    </html>
  );
}
