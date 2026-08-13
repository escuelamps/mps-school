'use client';

import { useState } from 'react';
import { Shield, X } from 'lucide-react';
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
          Autorizo el tratamiento de mis datos personales y el uso de imagen. {' '}
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
          >
            Ver política de privacidad
          </button>
        </label>
      </div>

      {hasError && (
        <p style={{ color: '#ff6961', fontSize: '0.8rem', marginTop: '0.5rem', marginLeft: '1.8rem' }}>
          Debes aceptar la política de privacidad para continuar.
        </p>
      )}

      {/* MODAL FLOTANTE */}
      {isModalOpen && (
        <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <Shield size={28} color="var(--accent)" />
              <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>Política de Privacidad y Habeas Data</h2>
            </div>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, <strong>Escuela MPS</strong> informa que los datos personales recopilados a través de nuestros canales serán tratados de forma segura y confidencial.
              </p>
              <p>
                Su finalidad es la gestión académica, envío de información sobre programas, tarifas, eventos y fines comerciales. Como titular, usted tiene derecho a conocer, actualizar, rectificar o solicitar la eliminación de sus datos en cualquier momento.
              </p>
              <p>
                <strong>Uso de Imagen en Redes Sociales:</strong> Asimismo, al vincularse a la escuela y aceptar estos términos, usted autoriza expresamente el uso, publicación y etiquetado de su imagen (o la del menor a su cargo) en fotografías y videos a través de nuestras redes sociales oficiales y plataformas digitales, estrictamente con fines institucionales y publicitarios.
              </p>
            </div>
            
            <button 
              type="button" 
              onClick={() => {
                onChange({ target: { checked: true } });
                setIsModalOpen(false);
              }}
              className="btn-primary"
              style={{ width: '100%', marginTop: '2rem' }}
            >
              Acepto
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
