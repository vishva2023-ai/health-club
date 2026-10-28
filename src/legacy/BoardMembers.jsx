import posterAsset from '@/assets/board-members-2026.jpeg.asset.json';
import naliniPhoto from '@/assets/board-nalini.jpg.asset.json';
import yuvarajPhoto from '@/assets/board-yuvaraj.jpg.asset.json';
import sanjayPhoto from '@/assets/board-sanjay.jpg.asset.json';
import sahanaPhoto from '@/assets/board-sahana.jpg.asset.json';
import devadharshiniPhoto from '@/assets/board-devadharshini.jpg.asset.json';
import jayashreePhoto from '@/assets/board-jayashree.jpg.asset.json';
import madhulikaPhoto from '@/assets/board-madhulika.jpg.asset.json';
import vishvaPhoto from '@/assets/board-vishva.jpg.asset.json';
import deepakPhoto from '@/assets/board-deepak.jpg.asset.json';
import dhuvarakashPhoto from '@/assets/board-dhuvarakash.jpg.asset.json';

const MEMBERS = [
  ['Nalini E', 'Faculty Coordinator'], ['Yuvaraj R', 'Chairperson'], ['Shri Sanjay Kumar V', 'Vice Chairperson'],
  ['Pavithra V', 'Secretary'], ['Sahana Ramanathan', 'Co-Secretary'], ['Devadharshini S', 'HR & Management Head'],
  ['G Jayashree', 'Events Head'], ['Madhulika J', 'Design Head'], ['Vishva S A', 'Editorial Head'],
  ['Deepak R', 'Finance Head'], ['Dhuvarakash T', 'Outreach Head'],
];
const PHOTOS = [naliniPhoto.url, yuvarajPhoto.url, sanjayPhoto.url, null, sahanaPhoto.url, devadharshiniPhoto.url, jayashreePhoto.url, madhulikaPhoto.url, vishvaPhoto.url, deepakPhoto.url, dhuvarakashPhoto.url];
const initials = (n) => n.split(' ').filter((w) => w.length > 1).slice(0, 2).map((w) => w[0]).join('');

export default function BoardMembers() {
  return <div className="board-members">
    <p className="board-intro">Health Club 2026 — meet the team behind every activity.</p>
    <div className="member-grid">
      {MEMBERS.map(([name, role], i) => <article key={name} className="member-card" style={{ animationDelay: `${i * 60}ms` }}>
        {PHOTOS[i] ? <img className="member-photo" src={PHOTOS[i]} alt={name} loading="lazy" /> : <span className="member-avatar" data-tone={i % 5}>{initials(name)}</span>}
        <h2>{name}</h2><small>{role}</small>
      </article>)}
    </div>
    <h2 className="board-poster-title">Official board poster</h2>
    <img className="board-poster" src={posterAsset.url} alt="Health Club 2026 board members poster with photos of all eleven members" loading="lazy" />
    <p className="board-contact">Instagram: health_club_vit · healthclub@vit.ac.in · LinkedIn: Health Club (VIT)</p>
  </div>;
}
