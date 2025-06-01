import { motion } from 'framer-motion';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

function AppPromo() {
  return (
    <section id="apppromo" className="py-16 bg-gradient-to-r from-red-700 to-red-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* App Promo Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Signaler une anomalie n'a jamais été aussi simple
            </h2>
            <p className="text-xl text-white/80 mb-6">
              Téléchargez l'application mobile pour signaler une anomalie en quelques secondes
            </p>
            
           <div className="flex flex-col  justify-center sm:flex-row gap-4">
              <a 
                href="https://play.google.com/store/apps?hl=fr&pli=1" 
                className="flex items-center justify-center sm:justify-start gap-2 bg-green-700 py-3 px-6 rounded-lg hover:bg-green-800 transition-colors shadow-lg"
              >
                <FaGooglePlay className="text-2xl" />
                <div>
                  <div className="text-xs text-white/80">TÉLÉCHARGER SUR</div>
                  <div className="font-medium">Google Play</div>
                </div>
              </a>
              
              <a 
                href="https://www.apple.com/fr/app-store/" 
                className="flex items-center justify-center sm:justify-start gap-2 bg-green-700 py-3 px-6 rounded-lg hover:bg-green-800 transition-colors shadow-lg"
              >
                <FaApple className="text-2xl" />
                <div>
                  <div className="text-xs text-white/80">TÉLÉCHARGER SUR</div>
                  <div className="font-medium">App Store</div>
                </div>
              </a>
            </div>

            
            <div className="mt-6 text-white/80">
              <p>Disponible pour Android et IOS. Gratuit et sans publicité.</p>
            </div>
          </motion.div>
          
          {/* App Screenshot */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
               <div className="w-[250px] h-[500px] bg-white rounded-[28px] overflow-hidden shadow-2xl">
                  {/* Screenshot de l'application */}
                  <img 
                    src="mobile.jpeg" 
                    alt="Screenshot de l'application Observatoire"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-400 rounded-full opacity-30 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-red-400 rounded-full opacity-30 blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AppPromo;