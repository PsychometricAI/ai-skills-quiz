import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} AI Skills Prophet. Educational purposes only.</p>
      </div>
    </footer>
  );
}
