import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1">
          <div className="text-xl font-bold tracking-widest uppercase text-neutral-900 mb-8 font-h1">ProductGo</div>
          <p className="font-body-md text-on-surface-variant mb-8">Curating the finest selection of global lifestyle products.</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary cursor-pointer hover:opacity-50">public</span>
            <span className="material-symbols-outlined text-primary cursor-pointer hover:opacity-50">share</span>
            <span className="material-symbols-outlined text-primary cursor-pointer hover:opacity-50">mail</span>
          </div>
        </div>

        <div>
          <h4 className="font-button text-button text-primary uppercase tracking-widest mb-8">Shop</h4>
          <ul className="space-y-4 font-body-md text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" to="/products">New Arrivals</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/products">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-button text-button text-primary uppercase tracking-widest mb-8">Account</h4>
          <ul className="space-y-4 font-body-md text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" to="/login">Sign In</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/register">Register</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/orders">My Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-button text-button text-primary uppercase tracking-widest mb-8">Newsletter</h4>
          <p className="font-body-md text-on-surface-variant mb-6">Join for exclusive early access and seasonal updates.</p>
          <div className="flex border-b border-neutral-300 py-2">
            <input className="bg-transparent border-none focus:ring-0 w-full placeholder:text-neutral-400 text-sm" placeholder="Your email address" type="email"/>
            <button className="material-symbols-outlined text-primary">arrow_forward</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[12px] uppercase tracking-widest text-neutral-400">© 2026 ProductGo. All rights reserved.</p>
        <div className="flex gap-8 text-[12px] uppercase tracking-widest text-neutral-400">
          <a href="#" className="hover:text-primary">Privacy Policy</a>
          <a href="#" className="hover:text-primary">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
