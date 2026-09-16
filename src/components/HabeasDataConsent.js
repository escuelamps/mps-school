'use client';

import { useState } from 'react';
import { Shield, FileText } from 'lucide-react';
import { ModalOverlay } from './Modals';

export default function HabeasDataConsent({ checked, onChange, hasError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
        <input 
          type="checkbox" 
          id="habeasData"
          checked={checked}
          onChange={onChange}
          style={{ 
            marginTop: '0.2rem',
            width: '18px',
            height: '18px',
            accentColor: 'var(--accent)',
            cursor: 'pointer'
          }}
        />
        <label htmlFor="habeasData" style={{ fontSize: '0.85rem', color: hasError ? '#ff6961' : 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
          He leído y acepto los Términos, Condiciones y el tratamiento de mis datos personales. {' '}
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
          >
            Ver contrato y políticas
          </button>
        </label>
      </div>

      {hasError && (
        <p style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.5rem', marginLeft: '1.8rem' }}>
          Debes aceptar los términos y condiciones para continuar.
        </p>
      )}

      {/* MODAL FLOTANTE */}
      {isModalOpen && (
        <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div style={{ position: 'relative', maxHeight: '80vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <FileText size={28} color="var(--accent)" />
              <h2 className="text-gradient" style={{ fontSize: '1.4rem', margin: 0, lineHeight: '1.2' }}>Contrato de Prestación de Servicios y Política de Privacidad</h2>
            </div>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'justify' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <strong style={{ color: 'white', display: 'block', fontSize: '1.1rem' }}>Escuela musical Mi Primer Sol</strong>
                NIT: 1030604986-1<br/>
                Dirección: Carrera 17 # 58a - 37<br/>
                Teléfono: 3023557760<br/>
                Correo: escuelamusicalmiprimersol@gmail.com<br/>
                Bogotá D.C.
              </div>

              <div>
                <strong style={{ color: 'white' }}>1. OBJETO DEL CONTRATO</strong>
                <p>El presente documento constituye un contrato de prestación de servicios educativos no formales en modalidad domiciliaria o virtual, para la enseñanza musical, entre LA ESCUELA DE MÚSICA MI PRIMER SOL y el TITULAR. Su objetivo es establecer los derechos, obligaciones y condiciones bajo las cuales se prestará el servicio, con el fin de garantizar un proceso educativo musical de calidad.</p>
              </div>

              <div>
                <strong style={{ color: 'white' }}>2. OBLIGACIONES DEL PROVEEDOR</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  <li>Impartir las clases según el programa y horario acordado.</li>
                  <li>Contar con instructores calificados e idóneos.</li>
                  <li>Informar con antelación cualquier cambio de profesor o modificación en la programación.</li>
                  <li>Garantizar un ambiente de aprendizaje respetuoso y seguro.</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'white' }}>3. OBLIGACIONES DEL TITULAR Y ESTUDIANTE</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  <li>Proporcionar información veraz y actualizada en el formulario de matrícula.</li>
                  <li>Garantizar un espacio adecuado y seguro para el desarrollo de la clase domiciliaria.</li>
                  <li>Cumplir con los pagos en las fechas establecidas.</li>
                  <li>Comunicar con 24 horas de anticipación la inasistencia o cancelación de una clase.</li>
                  <li>Fomentar el respeto hacia el instructor y el material de trabajo.</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'white' }}>4. POLÍTICAS DE PAGO</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  <li>El valor de la mensualidad debe cancelarse antes del inicio de las clases del paquete correspondiente.</li>
                  <li>Los pagos se realizarán mediante consignación bancaria, transferencia o en efectivo en la sede administrativa.</li>
                  <li>No se iniciarán clases pendientes de pago.</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'white' }}>5. POLÍTICA DE CANCELACIÓN Y REPOSICIÓN DE CLASES</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  <li>El titular tiene derecho a cancelar una clase por mes sin necesidad de justificación, siempre que se notifique con mínimo 24 horas de antelación.</li>
                  <li>Las clases canceladas con menos de 24 horas de anticipación no serán repuestas ni reembolsadas.</li>
                  <li>Las clases no impartidas por causa imputable al PROVEEDOR serán reprogramadas sin costo adicional.</li>
                  <li>No se repondrán clases por inasistencia injustificada o cancelación extemporánea.</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'white' }}>6. PROTECCIÓN DE DATOS PERSONALES Y USO DE IMAGEN</strong>
                <p>De acuerdo con la Ley 1581 de 2012, el titular autoriza el tratamiento de sus datos personales y los del estudiante para fines académicos, administrativos y de comunicación relacionados con el servicio contratado.</p>
                <p>Asimismo, al vincularse a la escuela, usted autoriza expresamente el uso, publicación y etiquetado de su imagen (o la del menor a su cargo) en fotografías y videos a través de nuestras redes sociales oficiales y plataformas digitales, estrictamente con fines institucionales y publicitarios.</p>
              </div>

              <div>
                <strong style={{ color: 'white' }}>7. PROPIEDAD INTELECTUAL Y MATERIAL</strong>
                <p>Todo material suministrado por EL PROVEEDOR (partituras, métodos, ejercicios) es de uso exclusivo del estudiante y no puede ser reproducido, distribuido o comercializado.</p>
              </div>

              <div>
                <strong style={{ color: 'white' }}>8. DURACIÓN Y TERMINACIÓN DEL CONTRATO</strong>
                <p>El contrato tendrá vigencia por el período académico pactado. Cualquier parte podrá terminarlo mediante aviso escrito con 15 días de antelación. No habrá lugar a reembolsos por terminación anticipada por parte del titular.</p>
              </div>

            </div>
            
            <button 
              type="button" 
              onClick={() => {
                onChange({ target: { checked: true } });
                setIsModalOpen(false);
              }}
              className="btn-primary"
              style={{ width: '100%', marginTop: '2rem', position: 'sticky', bottom: 0, boxShadow: '0 -10px 20px rgba(0,0,0,0.8)' }}
            >
              He leído y acepto los términos
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
