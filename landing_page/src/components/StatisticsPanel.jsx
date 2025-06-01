import { useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowUp, FaArrowDown, FaRegClock, FaRegChartBar, FaRegUser } from 'react-icons/fa';
import { globalStatistics, alertMessages } from '../data/statisticsData';

function StatisticsPanel() {
  const containerRef = useRef(null);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'chart': return <FaRegChartBar className="w-6 h-6" />;
      case 'trend': return <FaChartLine className="w-6 h-6" />;
      case 'clock': return <FaRegClock className="w-6 h-6" />;
      case 'user': return <FaRegUser className="w-6 h-6" />;
      default: return <FaRegChartBar className="w-6 h-6" />;
    }
  };

  return (
    <section id="statistics" className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6" ref={containerRef}>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-4">
            Statistiques globales
          </h2>
          <p className="text-lg text-green-700 max-w-3xl mx-auto">
            Consultez les indicateurs clés et les tendances récentes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {globalStatistics.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="bg-white rounded-xl shadow-soft p-6 border border-red-100 hover:shadow-lg hover:border-red-200 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-green-700">{stat.title}</h3>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold text-red-800">
                      <CountUp end={stat.value} duration={2} />
                    </span>
                    <span className="ml-1 text-2xl font-medium text-red-800">{stat.unit}</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  {getIconComponent(stat.icon)}
                </div>
              </div>
              
              <p className="mt-2 text-neutral-600">{stat.description}</p>
              
              <div className="mt-4 flex items-center">
                <span className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.trend === 'up' 
                    ? <FaArrowUp className="mr-1" /> 
                    : <FaArrowDown className="mr-1" />
                  }
                  {stat.trendValue}%
                </span>
                <span className="ml-2 text-sm text-neutral-500">vs mois précédent</span>
              </div>
            </motion.div>
          ))}
        </div>

       
      </div>
    </section>
  );
}

export default StatisticsPanel;