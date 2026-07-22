import constants from "@/constants";

export default function MagicLink({ url }: { url: string }) {
    return <>
    <div className="container">
      <div className="header">
        Welcome to HackKU!
      </div>
      <div className="content">
        <h1>Sign in to HackKU</h1>
        <p>Access your HackKU account with the button below:</p>
        <a href={url} className="button" style={{
            display: "inline-block",
            margin: "20px 0",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#ffffff",
            background: "#1a73e8",
            textDecoration: "none",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"}}
        >Sign in</a>
        <p>
          This request was generated at {new Date().toLocaleString()}.
        </p>
        <p>
            If you didn't request this, please ignore this email or reach out to us at
            <a href={`mailto:${constants.supportEmail}`} style={{ color: "#1a73e8", textDecoration: "none" }}>
                {constants.supportEmail}
            </a>
        </p>
      </div>
      <div className="footer">
        <p>© {new Date().getFullYear()} HackKU. All rights reserved.</p>
      </div>
    </div>
    </>
}