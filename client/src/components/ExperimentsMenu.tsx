import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Experiment {
  id: string;
  title: string;
  description: string;
  link: string;
}

interface Chapter {
  id: string;
  title: string;
  experiments: Experiment[];
}

interface Subject {
  id: string;
  name: string;
  icon: string;
}

// Available subjects
const subjects: Subject[] = [
  {
    id: 'physics', 
    name: 'Vật lí',
    icon: '⚡'
  },
  {
    id: 'chemistry',
    name: 'Hóa học',
    icon: '⚗️'
  }
];

// Data for Grade 11 Physics experiments (from provided document)
const physicsGrade11Chapters: Chapter[] = [
  {
    id: "chapter1-11",
    title: "Chương 1: Dao động",
    experiments: [
      {
        id: "spring-oscillation",
        title: "Dao động điều hòa",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "spring-masses",
        title: "Dao động lò xo",
        description: "Dao động lò xo",
        link: "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_all.html?locale=vi"
      },
      {
        id: "pendulum-motion",
        title: "Vận tốc, gia tốc, năng lượng",
        description: "Dao động điều hòa",
        link: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_vi.html"
      },
      {
        id: "damped-resonance",
        title: "Dao động tắt dần, cộng hưởng",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "trigonometry-circle",
        title: "Vòng tròn lượng giác",
        description: "Khám phá các hàm lượng giác trên vòng tròn",
        link: "https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter2-11",
    title: "Chương 2: Sóng",
    experiments: [
      {
        id: "mechanical-waves",
        title: "Mô tả sóng cơ",
        description: "Sóng cơ",
        link: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_vi.html"
      },
      {
        id: "standing-waves",
        title: "Sóng dừng",
        description: "Sóng dừng trên dây",
        link: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_vi.html"
      },
      {
        id: "wave-interference",
        title: "Giao thoa sóng",
        description: "Giao thoa sóng 2 nguồn",
        link: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_vi.html"
      },
      {
        id: "sound-transmission",
        title: "Truyền âm",
        description: "Sắp có",
        link: "#"
      }
    ]
  },
  {
    id: "chapter3-11",
    title: "Chương 3: Điện trường",
    experiments: [
      {
        id: "coulombs-law",
        title: "Định luật Coulomb",
        description: "Định luật Coulomb",
        link: "https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law_all.html?locale=vi"
      },
      {
        id: "electric-charges-field",
        title: "Lực tương tác, điện trường, điện thế",
        description: "Điện trường của các điện tích",
        link: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_vi.html"
      },
      {
        id: "uniform-electric-field",
        title: "Điện trường đều, đường sức",
        description: "Điện trường đều",
        link: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_vi.html?locale=vi"
      },
      {
        id: "capacitors",
        title: "Tụ điện",
        description: "Tụ điện",
        link: "https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_vi.html"
      }
    ]
  },
  {
    id: "chapter4-11",
    title: "Chương 4: Dòng điện, mạch điện",
    experiments: [
      {
        id: "ohms-law",
        title: "Cường độ dòng điện, điện trở",
        description: "Định luật Ôm",
        link: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_vi.html"
      },
      {
        id: "battery-voltage",
        title: "Nguồn điện",
        description: "Pin và điện áp",
        link: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_vi.html"
      },
      {
        id: "dc-circuits",
        title: "Mạch điện",
        description: "Lắp mạch điện DC",
        link: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_vi.html?locale=vi"
      },
      {
        id: "emf-internal-resistance",
        title: "Suất điện động & nội trở",
        description: "Sắp có",
        link: "#"
      }
    ]
  }
];

// Data for Grade 10 Physics experiments (from provided document)
const physicsGrade10Chapters: Chapter[] = [
  {
    id: "chapter1",
    title: "Chương 1: Mở đầu",
    experiments: [
      {
        id: "coming-soon",
        title: "Sắp ra mắt",
        description: "Thí nghiệm đang được chuẩn bị",
        link: "#"
      }
    ]
  },
  {
    id: "chapter2", 
    title: "Chương 2: Động học",
    experiments: [
      {
        id: "displacement-distance",
        title: "Độ dịch chuyển và quãng đường",
        description: "Sắp ra mắt",
        link: "#"
      },
      {
        id: "speed-velocity",
        title: "Tốc độ và vận tốc", 
        description: "Sắp ra mắt",
        link: "#"
      },
      {
        id: "acceleration-motion",
        title: "Gia tốc, chuyển động biến đổi",
        description: "Sắp ra mắt",
        link: "#"
      },
      {
        id: "free-fall",
        title: "Sự rơi tự do",
        description: "Sắp ra mắt",
        link: "#"
      },
      {
        id: "projectile-motion",
        title: "Chuyển động ném", 
        description: "Chuyển động ném (Projectile Motion)",
        link: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter3",
    title: "Chương 3: Động lực học", 
    experiments: [
      {
        id: "newton-laws",
        title: "Định luật Newton",
        description: "Lực và chuyển động cơ bản",
        link: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=vi"
      },
      {
        id: "gravity-tension",
        title: "Trọng lực và lực căng",
        description: "Sắp ra mắt", 
        link: "#"
      },
      {
        id: "friction-force",
        title: "Lực ma sát",
        description: "Lực và chuyển động cơ bản",
        link: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=vi"
      },
      {
        id: "torque-balance",
        title: "Moment lực – Cân bằng",
        description: "Thăng bằng (Balancing Act)",
        link: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter4",
    title: "Chương 4: Năng lượng, công, công suất",
    experiments: [
      {
        id: "energy-work",
        title: "Năng lượng, công, bảo toàn", 
        description: "Công viên năng lượng",
        link: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html?locale=vi"
      },
      {
        id: "efficiency",
        title: "Hiệu suất",
        description: "So sánh hao hụt năng lượng", 
        link: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter5",
    title: "Chương 5: Động lượng",
    experiments: [
      {
        id: "momentum-collision",
        title: "Động lượng, bảo toàn, va chạm",
        description: "Va chạm 2D (Collision Lab)",
        link: "https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter6", 
    title: "Chương 6: Chuyển động tròn",
    experiments: [
      {
        id: "circular-motion",
        title: "Động học, lực hướng tâm",
        description: "Sắp ra mắt",
        link: "#"
      }
    ]
  },
  {
    id: "chapter7",
    title: "Chương 7: Biến dạng – Áp suất chất lỏng",
    experiments: [
      {
        id: "solid-deformation",
        title: "Biến dạng vật rắn", 
        description: "Sắp ra mắt",
        link: "#"
      },
      {
        id: "liquid-pressure",
        title: "Áp suất chất lỏng",
        description: "Áp suất chất lỏng (Under Pressure)",
        link: "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html?locale=vi"
      }
    ]
  }
];

// Data for Grade 12 Physics experiments (from provided document)
const physicsGrade12Chapters: Chapter[] = [
  {
    id: "chapter1-12",
    title: "Chương I: Vật lí nhiệt",
    experiments: [
      {
        id: "matter-states",
        title: "Cấu trúc chất & chuyển thể",
        description: "Trạng thái vật chất cơ bản",
        link: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html?locale=vi"
      },
      {
        id: "internal-energy",
        title: "Nội năng, Định luật I",
        description: "Dạng năng lượng và chuyển đổi",
        link: "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html?locale=vi"
      },
      {
        id: "temperature",
        title: "Nhiệt độ & nhiệt kế",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "specific-heat",
        title: "Nhiệt dung riêng",
        description: "Dạng năng lượng và chuyển đổi",
        link: "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html?locale=vi"
      },
      {
        id: "fusion-heat",
        title: "Nhiệt nóng chảy riêng",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "vaporization-heat",
        title: "Nhiệt hóa hơi riêng",
        description: "Sắp có",
        link: "#"
      }
    ]
  },
  {
    id: "chapter2-12",
    title: "Chương II: Khí lí tưởng",
    experiments: [
      {
        id: "kinetic-theory",
        title: "Thuyết động học phân tử",
        description: "Trạng thái vật chất",
        link: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_all.html?locale=vi"
      },
      {
        id: "boyle-mariotte",
        title: "Định luật Boyle – Mariotte",
        description: "Tính chất khí",
        link: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html?locale=vi"
      },
      {
        id: "charles-law",
        title: "Định luật Charles",
        description: "Tính chất khí",
        link: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html?locale=vi"
      },
      {
        id: "ideal-gas-equation",
        title: "Phương trình trạng thái khí lí tưởng",
        description: "Tính chất khí",
        link: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html?locale=vi"
      },
      {
        id: "gas-pressure",
        title: "Áp suất khí",
        description: "Tính chất khí",
        link: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter3-12",
    title: "Chương III: Từ trường",
    experiments: [
      {
        id: "magnetic-field",
        title: "Từ trường",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "magnetic-force",
        title: "Lực từ tác dụng lên dây dẫn",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "electromagnetic-induction",
        title: "Cảm ứng điện từ",
        description: "Định luật Faraday",
        link: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html?locale=vi"
      },
      {
        id: "induced-current",
        title: "Dòng điện cảm ứng",
        description: "Định luật Faraday",
        link: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html?locale=vi"
      },
      {
        id: "ac-generator",
        title: "Máy phát điện xoay chiều",
        description: "Định luật Faraday",
        link: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html?locale=vi"
      }
    ]
  },
  {
    id: "chapter4-12",
    title: "Chương IV: Vật lí hạt nhân",
    experiments: [
      {
        id: "rutherford-scattering",
        title: "Tán xạ Rutherford",
        description: "Tán xạ Rutherford",
        link: "https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering_all.html?locale=vi"
      },
      {
        id: "nuclear-reaction",
        title: "Phản ứng hạt nhân & năng lượng liên kết",
        description: "Sắp có",
        link: "#"
      },
      {
        id: "alpha-decay",
        title: "Phóng xạ Alpha",
        description: "Phóng xạ Alpha",
        link: "https://phet.colorado.edu/sims/cheerpj/nuclear-physics/latest/nuclear-physics.html?simulation=alpha-decay&locale=vi"
      },
      {
        id: "beta-decay",
        title: "Phóng xạ Beta",
        description: "Phóng xạ Beta",
        link: "https://phet.colorado.edu/sims/cheerpj/nuclear-physics/latest/nuclear-physics.html?simulation=beta-decay&locale=vi"
      }
    ]
  }
];

// Data for Chemistry experiments - Direct access
const chemistryExperiments: Chapter[] = [
  {
    id: "chemistry-main",
    title: "Thí nghiệm Hóa học PhET Colorado",
    experiments: [
      {
        id: "periodic-table-3d",
        title: "Bảng tuần hoàn hoá học 3D",
        description: "Khám phá bảng tuần hoàn với hiệu ứng 3D tương tác",
        link: "https://bth1.vercel.app/"
      },
      {
        id: "periodic-table-classic",
        title: "Bảng tuần hoàn hoá học gốc",
        description: "Bảng tuần hoàn cổ điển với đầy đủ thông tin nguyên tố",
        link: "https://ptable.com/?lang=vi#Properties"
      },
      {
        id: "acid-base-solutions",
        title: "Dung dịch Axit – Bazơ",
        description: "Nghiên cứu tính chất axit và bazơ của các dung dịch",
        link: "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_vi.html"
      },
      {
        id: "atomic-interactions",
        title: "Tương tác nguyên tử",
        description: "Khám phá lực tương tác giữa các nguyên tử",
        link: "https://phet.colorado.edu/sims/html/atomic-interactions/latest/atomic-interactions_vi.html"
      },
      {
        id: "balancing-chemical-equations",
        title: "Cân bằng phương trình hóa học",
        description: "Luyện tập cân bằng các phương trình phản ứng hóa học",
        link: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_vi.html"
      },
      {
        id: "beers-law-lab",
        title: "Định luật Beer (Quang phổ hấp thụ)",
        description: "Tìm hiểu về định luật Beer và quang phổ hấp thụ",
        link: "https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_vi.html"
      },
      {
        id: "build-a-molecule",
        title: "Xây dựng phân tử",
        description: "Tạo các phân tử hóa học từ các nguyên tử",
        link: "https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_vi.html"
      },
      {
        id: "build-an-atom",
        title: "Xây dựng nguyên tử",
        description: "Xây dựng nguyên tử với proton, neutron và electron",
        link: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_vi.html"
      },
      {
        id: "concentration",
        title: "Nồng độ dung dịch",
        description: "Nghiên cứu về nồng độ và pha loãng dung dịch",
        link: "https://phet.colorado.edu/sims/html/concentration/latest/concentration_vi.html"
      },
      {
        id: "isotopes-atomic-mass",
        title: "Đồng vị và khối lượng nguyên tử",
        description: "Tìm hiểu về đồng vị và cách tính khối lượng nguyên tử",
        link: "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_vi.html"
      },
      {
        id: "molecule-polarity",
        title: "Độ phân cực phân tử",
        description: "Khám phá độ phân cực của các phân tử hóa học",
        link: "https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity_vi.html"
      },
      {
        id: "molecules-and-light",
        title: "Phân tử và ánh sáng",
        description: "Tương tác giữa phân tử và bức xạ điện từ",
        link: "https://phet.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light_vi.html"
      },
      {
        id: "molecule-shapes",
        title: "Hình dạng phân tử",
        description: "Nghiên cứu hình dạng không gian của phân tử",
        link: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_vi.html"
      },
      {
        id: "molecule-shapes-basics",
        title: "Hình dạng phân tử – Cơ bản",
        description: "Phiên bản cơ bản về hình dạng phân tử",
        link: "https://phet.colorado.edu/sims/html/molecule-shapes-basics/latest/molecule-shapes-basics_vi.html"
      },
      {
        id: "molarity",
        title: "Nồng độ mol (Molarity)",
        description: "Tìm hiểu về nồng độ mol và cách tính toán",
        link: "https://phet.colorado.edu/sims/html/molarity/latest/molarity_vi.html"
      },
      {
        id: "reactants-products-leftovers",
        title: "Chất phản ứng, sản phẩm và chất dư",
        description: "Nghiên cứu về chất phản ứng và sản phẩm trong phản ứng",
        link: "https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_vi.html"
      },
      {
        id: "states-of-matter-basics",
        title: "Trạng thái vật chất – Cơ bản",
        description: "Khám phá các trạng thái cơ bản của vật chất",
        link: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_vi.html"
      },
      {
        id: "states-of-matter",
        title: "Trạng thái vật chất",
        description: "Nghiên cứu chi tiết về các trạng thái vật chất",
        link: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_vi.html"
      },
      {
        id: "ph-scale",
        title: "Thang pH",
        description: "Tìm hiểu về thang đo pH và tính axit-bazơ",
        link: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_vi.html"
      },
      {
        id: "ph-scale-basics",
        title: "Thang pH – Cơ bản",
        description: "Phiên bản cơ bản về thang pH",
        link: "https://phet.colorado.edu/sims/html/ph-scale-basics/latest/ph-scale-basics_vi.html"
      }
    ]
  }
];

interface ExperimentsMenuProps {
  selectedSubject?: string;
}

export default function ExperimentsMenu({ selectedSubject: propSelectedSubject }: ExperimentsMenuProps) {
  const [currentLevel, setCurrentLevel] = useState<'main' | 'grade-selection' | 'class-selection' | 'chapter-list' | 'experiment-list' | 'experiment-view'>(
    propSelectedSubject ? 'grade-selection' : 'main'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(propSelectedSubject || '');
  const [selectedGrade, setSelectedGrade] = useState<'thcs' | 'thpt' | null>(null);
  const [selectedClass, setSelectedClass] = useState<'10' | '11' | '12' | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

  const resetToMain = () => {
    if (propSelectedSubject) {
      if (propSelectedSubject === 'chemistry') {
        setCurrentLevel('experiment-list');
      } else {
        setCurrentLevel('grade-selection');
      }
      setSelectedSubject(propSelectedSubject);
    } else {
      setCurrentLevel('main');
      setSelectedSubject('');
    }
    setSelectedGrade(null);
    setSelectedClass(null);
    setSelectedChapter(null);
    setSelectedExperiment(null);
    setExpandedChapters([]);
  };

  const handleSubjectSelect = (subjectId: string) => {
    if (subjectId !== 'physics' && subjectId !== 'chemistry') {
      // Only physics and chemistry are available
      return;
    }
    setSelectedSubject(subjectId);
    if (subjectId === 'chemistry') {
      setCurrentLevel('experiment-list');
    } else {
      setCurrentLevel('grade-selection');
    }
  };

  const handleGradeSelect = (grade: 'thcs' | 'thpt') => {
    setSelectedGrade(grade);
    if (grade === 'thcs') {
      // For THCS, go directly to experiments (not implemented yet)
      setCurrentLevel('experiment-list');
    } else {
      setCurrentLevel('class-selection');
    }
  };

  const handleClassSelect = (classNum: '10' | '11' | '12') => {
    setSelectedClass(classNum);
    setCurrentLevel('chapter-list');
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleExperimentSelect = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setCurrentLevel('experiment-view');
  };

  const getCurrentChapters = () => {
    if (selectedSubject === 'physics') {
      if (selectedClass === '10') return physicsGrade10Chapters;
      if (selectedClass === '11') return physicsGrade11Chapters;
      if (selectedClass === '12') return physicsGrade12Chapters;
    }
    if (selectedSubject === 'chemistry') {
      return chemistryExperiments;
    }
    return [];
  };

  // Render experiment view
  if (currentLevel === 'experiment-view' && selectedExperiment) {
    return (
      <div className="space-y-4 w-full max-w-none">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{selectedExperiment.title}</h3>
            <p className="text-gray-600">{selectedExperiment.description}</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentLevel('chapter-list')}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại danh sách
          </Button>
        </div>

        <div className="w-full max-w-none">
          <div className="w-screen relative left-1/2 transform -translate-x-1/2">
            <Card className="w-full border-0 shadow-2xl mx-4" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
              <CardContent className="p-0 h-full">
                {selectedExperiment.link === '#' ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <i className="fas fa-flask text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Thí nghiệm đang được chuẩn bị</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={selectedExperiment.link}
                    className="w-full h-full border-0 shadow-lg"
                    title={selectedExperiment.title}
                    allowFullScreen
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render chapter list for selected class
  if (currentLevel === 'chapter-list') {
    const chapters = getCurrentChapters();
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Thí nghiệm {subjects.find(s => s.id === selectedSubject)?.name} lớp {selectedClass} - {selectedGrade?.toUpperCase()}
          </h3>
          <Button variant="outline" onClick={() => setCurrentLevel('class-selection')}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Button>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter: Chapter) => (
            <Card key={chapter.id} className="border border-gray-200">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{chapter.title}</CardTitle>
                  <i className={`fas ${expandedChapters.includes(chapter.id) ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                </div>
              </CardHeader>
              
              {expandedChapters.includes(chapter.id) && (
                <CardContent>
                  <div className="space-y-3">
                    {chapter.experiments.map((experiment: Experiment) => (
                      <div key={experiment.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{experiment.title}</h4>
                            <p className="text-sm text-gray-600">{experiment.description}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleExperimentSelect(experiment)}
                            disabled={experiment.link === '#'}
                          >
                            {experiment.link === '#' ? 'Sắp có' : 'Mở thí nghiệm'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render class selection (for THPT)
  if (currentLevel === 'class-selection' && selectedGrade === 'thpt') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Chọn lớp THPT</h3>
          <Button variant="outline" onClick={() => setCurrentLevel('grade-selection')}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Physics Classes */}
          {selectedSubject === 'physics' && ['10', '11', '12'].map((classNum) => (
            <Card 
              key={classNum}
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200"
              onClick={() => handleClassSelect(classNum as '10' | '11' | '12')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Lớp {classNum}</div>
                <p className="text-gray-600">
                  {classNum === '10' && 'Cơ học, Nhiệt học'}
                  {classNum === '11' && 'Dao động, Sóng, Điện học'}
                  {classNum === '12' && 'Nhiệt học, Từ học, Hạt nhân'}
                </p>
                <div className="mt-2 text-sm text-green-600">
                  <i className="fas fa-check-circle mr-1"></i>
                  Sẵn sàng
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Chemistry Classes */}
          {selectedSubject === 'chemistry' && (
            <>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200"
                onClick={() => handleClassSelect('10')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">Lớp 10</div>
                  <p className="text-gray-600">Cấu tạo nguyên tử, Bảng tuần hoàn</p>
                  <div className="mt-2 text-sm text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Sẵn sàng
                  </div>
                </CardContent>
              </Card>

              {['11', '12'].map((classNum) => (
                <Card key={classNum} className="opacity-50 border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-gray-500 mb-2">Lớp {classNum}</div>
                    <p className="text-gray-500">
                      {classNum === '11' && 'Liên kết hóa học, Phản ứng'}
                      {classNum === '12' && 'Hóa hữu cơ, Tổng hợp'}
                    </p>
                    <div className="mt-2 text-sm text-orange-600">
                      <i className="fas fa-clock mr-1"></i>
                      Sắp ra mắt
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // Render grade selection
  if (currentLevel === 'grade-selection') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Chọn cấp học - {subjects.find(s => s.id === selectedSubject)?.name}</h3>
          <Button variant="outline" onClick={resetToMain}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200"
            onClick={() => handleGradeSelect('thpt')}
          >
            <CardContent className="p-8 text-center">
              <i className="fas fa-university text-4xl text-blue-600 mb-4"></i>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">THPT</h3>
              <p className="text-gray-600">Thí nghiệm {subjects.find(s => s.id === selectedSubject)?.name} lớp 10, 11, 12</p>
              <div className="mt-4 text-sm">
                <div className="text-green-600">
                  <i className="fas fa-check-circle mr-1"></i>
                  Sẵn sàng
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render subject selection
  if (currentLevel === 'main') {
    return (
      <div className="space-y-6">
        {/* PhET Information Section */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-info-circle text-2xl text-orange-600 mr-3"></i>
              <h3 className="text-xl font-bold text-orange-700">Giới thiệu PhET Interactive Simulations</h3>
            </div>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>PhET là dự án giáo dục do Đại học Colorado Boulder (Mỹ) phát triển từ năm 2002.</p>
              <p>Cung cấp mô phỏng khoa học và toán học trực quan, sinh động, miễn phí.</p>
              <p>Bao gồm các lĩnh vực: Vật lý, Hóa học.....</p>
              <p>Thiết kế dạng trò chơi tương tác, giúp học sinh dễ hiểu và hứng thú hơn.</p>
              <p className="font-medium text-orange-800">Mục tiêu: Giúp người học tiếp cận kiến thức khoa học một cách trực quan, dễ hiểu và gắn với thực tế.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Chọn môn học</h3>
          <Button variant="outline" onClick={resetToMain}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <Card 
              key={subject.id}
              className={`transition-shadow border-2 cursor-pointer hover:shadow-lg ${
                subject.id === 'physics' 
                  ? 'border-blue-200' 
                  : 'border-green-200'
              }`}
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">{subject.icon}</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">{subject.name}</h3>
                <div className="mt-4 text-sm">
                  <div className="text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Sẵn sàng
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render experiment view
  if (currentLevel === 'experiment-view' && selectedExperiment) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {selectedExperiment.title}
          </h3>
          <Button variant="outline" onClick={() => {
            if (selectedSubject === 'chemistry') {
              setCurrentLevel('experiment-list');
            } else {
              setCurrentLevel('chapter-list');
            }
          }}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại danh sách
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={selectedExperiment.link}
            className="w-full h-screen"
            style={{ aspectRatio: '16/9', minHeight: '500px' }}
            allowFullScreen
            title={selectedExperiment.title}
          />
        </div>
      </div>
    );
  }

  // Render experiment list for chemistry (direct access)
  if (currentLevel === 'experiment-list' && selectedSubject === 'chemistry') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Thí nghiệm Hóa học</h3>
          <Button variant="outline" onClick={resetToMain}>
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Button>
        </div>

        <div className="space-y-4">
          {chemistryExperiments[0].experiments.map((experiment: Experiment) => (
            <Card key={experiment.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{experiment.title}</h4>
                    <p className="text-sm text-gray-600">{experiment.description}</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleExperimentSelect(experiment)}
                    disabled={experiment.link === '#'}
                    className="ml-4"
                  >
                    {experiment.link === '#' ? 'Sắp có' : 'Mở thí nghiệm'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render main menu
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thí nghiệm PhET</h3>
        <p className="text-gray-600">Thí nghiệm mô phỏng tương tác cho học sinh</p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="text-center">
          <i className="fas fa-flask text-4xl text-purple-600 mb-4"></i>
          <Button 
            size="lg"
            onClick={() => setCurrentLevel('main')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <i className="fas fa-play mr-2"></i>
            Bắt đầu thí nghiệm
          </Button>
        </div>
      </Card>
    </div>
  );
}