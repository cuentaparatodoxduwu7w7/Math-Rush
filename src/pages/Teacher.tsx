import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, Modal, EmptyState } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

interface TeacherClass {
  id: string;
  name: string;
  code: string;
  students: number;
  grade: string;
}

interface Assignment {
  id: string;
  title: string;
  classId: string;
  topic: string;
  difficulty: string;
  dueDate: string;
  status: 'active' | 'completed' | 'draft';
}

export default function TeacherPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'classes' | 'assignments' | 'analytics'>('classes');
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [classes, setClasses] = useState<TeacherClass[]>([
    { id: '1', name: 'Matemática 3A', code: 'MATH3A', students: 28, grade: '3.º secundaria' },
    { id: '2', name: 'Matemática 4B', code: 'MATH4B', students: 22, grade: '4.º secundaria' },
  ]);
  const [assignments] = useState<Assignment[]>([
    { id: '1', title: 'Álgebra Básica', classId: '1', topic: 'Álgebra', difficulty: 'basico', dueDate: '2024-12-20', status: 'active' },
    { id: '2', title: 'Geometría Avanzada', classId: '2', topic: 'Geometría', difficulty: 'avanzado', dueDate: '2024-12-18', status: 'completed' },
  ]);

  function handleCreateClass() {
    if (!newClassName) return;
    const code = newClassName.substring(0, 4).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    setClasses([...classes, { id: Date.now().toString(), name: newClassName, code, students: 0, grade: newClassGrade }]);
    setNewClassName('');
    setNewClassGrade('');
    setShowCreateClass(false);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">👨‍🏫 Panel Docente</h1>
            <p className="text-gray-400 text-sm">Bienvenido, {user?.nickname}</p>
          </div>
          <Link to="/app">
            <Button variant="ghost" size="sm">← Volver</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'classes' as const, label: '📚 Mis Clases' },
            { id: 'assignments' as const, label: '📝 Actividades' },
            { id: 'analytics' as const, label: '📊 Analíticas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-rush-blue text-white' : 'bg-rush-card text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Mis Clases</h2>
              <Button variant="primary" size="sm" onClick={() => setShowCreateClass(true)}>+ Crear Clase</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map(cls => (
                <Card key={cls.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">{cls.name}</h3>
                    <Badge color="blue">{cls.grade}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>👥 {cls.students} estudiantes</span>
                    <span>📋 Código: <strong className="text-white">{cls.code}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Ver detalles</Button>
                    <Button variant="ghost" size="sm">Compartir código</Button>
                  </div>
                </Card>
              ))}
            </div>
            {classes.length === 0 && (
              <EmptyState icon="📚" title="No tienes clases" description="Crea tu primera clase para empezar." action={<Button variant="primary" onClick={() => setShowCreateClass(true)}>Crear Clase</Button>} />
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Actividades</h2>
              <Button variant="primary" size="sm" onClick={() => setShowCreateAssignment(true)}>+ Crear Actividad</Button>
            </div>
            <div className="space-y-3">
              {assignments.map(a => (
                <Card key={a.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{a.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color="purple">{a.topic}</Badge>
                      <span className="text-xs text-gray-400">Vence: {a.dueDate}</span>
                    </div>
                  </div>
                  <Badge color={a.status === 'active' ? 'green' : a.status === 'completed' ? 'blue' : 'yellow'}>
                    {a.status === 'active' ? 'Activa' : a.status === 'completed' ? 'Completada' : 'Borrador'}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="font-bold mb-4">Analíticas Generales</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-blue">50</p>
                <p className="text-xs text-gray-400">Estudiantes</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-green">78%</p>
                <p className="text-xs text-gray-400">Promedio aciertos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-orange">156</p>
                <p className="text-xs text-gray-400">Partidas totales</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-purple">12min</p>
                <p className="text-xs text-gray-400">Tiempo promedio</p>
              </Card>
            </div>
            <Card className="p-5">
              <h3 className="font-bold mb-3">Rendimiento por Clase</h3>
              {classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between py-2 border-b border-rush-purple/10 last:border-0">
                  <span className="text-sm">{cls.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-rush-darker rounded-full overflow-hidden">
                      <div className="h-full bg-rush-green rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
                    </div>
                    <span className="text-sm font-bold text-rush-green">{Math.round(60 + Math.random() * 30)}%</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <Modal isOpen={showCreateClass} onClose={() => setShowCreateClass(false)} title="Crear Clase">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de la clase</label>
            <input
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange"
              placeholder="Ej: Matemática 3A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Grado</label>
            <select
              value={newClassGrade}
              onChange={e => setNewClassGrade(e.target.value)}
              className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rush-orange"
            >
              <option value="">Seleccionar</option>
              <option value="1.º secundaria">1.º secundaria</option>
              <option value="2.º secundaria">2.º secundaria</option>
              <option value="3.º secundaria">3.º secundaria</option>
              <option value="4.º secundaria">4.º secundaria</option>
              <option value="5.º secundaria">5.º secundaria</option>
            </select>
          </div>
          <Button variant="primary" className="w-full" onClick={handleCreateClass}>Crear Clase</Button>
        </div>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal isOpen={showCreateAssignment} onClose={() => setShowCreateAssignment(false)} title="Crear Actividad">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input type="text" className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rush-orange" placeholder="Ej: Álgebra Básica" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tema</label>
            <select className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rush-orange">
              <option>Aritmética</option>
              <option>Álgebra</option>
              <option>Geometría</option>
              <option>Trigonometría</option>
              <option>Estadística</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Dificultad</label>
              <select className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rush-orange">
                <option>Principiante</option>
                <option>Básico</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Preguntas</label>
              <input type="number" defaultValue={10} className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rush-orange" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Fecha límite</label>
            <input type="date" className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rush-orange" />
          </div>
          <Button variant="primary" className="w-full" onClick={() => setShowCreateAssignment(false)}>Crear Actividad</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
