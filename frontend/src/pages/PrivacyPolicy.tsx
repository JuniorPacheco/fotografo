const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-4 mb-6">
          Política de Privacidad - Cabal Studios Dashboard
        </h1>
        <p className="text-muted-foreground italic mb-8">
          <strong>Última actualización:</strong> Diciembre 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Información General</h2>
          <p className="text-foreground leading-relaxed">
            Cabal Studios ("nosotros", "nuestro", "la aplicación") se compromete a proteger la privacidad de los usuarios de nuestro sistema de gestión interno. Esta política describe cómo recopilamos, usamos y protegemos la información personal.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Alcance de la Aplicación</h2>
          <p className="text-foreground leading-relaxed">
            Esta aplicación es un sistema de gestión interno destinado exclusivamente para uso administrativo por parte del personal autorizado de Cabal Studios. No es una aplicación pública y el acceso está restringido a usuarios autorizados.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Información que Recopilamos</h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.1 Información de Clientes</h3>
          <ul className="list-disc list-inside text-foreground space-y-2 mb-4">
            <li>Nombres</li>
            <li>Números de teléfono</li>
            <li>Direcciones de correo electrónico</li>
            <li>Direcciones físicas</li>
            <li>Números de identificación (cédula)</li>
            <li>Información de facturas y pagos</li>
            <li>Información de sesiones fotográficas</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.2 Información de Usuarios del Sistema</h3>
          <ul className="list-disc list-inside text-foreground space-y-2">
            <li>Nombres</li>
            <li>Direcciones de correo electrónico</li>
            <li>Roles y permisos de acceso</li>
            <li>Registros de actividad</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cómo Usamos la Información</h2>
          <p className="text-foreground leading-relaxed mb-3">La información recopilada se utiliza exclusivamente para:</p>
          <ul className="list-disc list-inside text-foreground space-y-2">
            <li>Gestionar clientes y sus servicios fotográficos</li>
            <li>Procesar pagos y facturas</li>
            <li>Programar y gestionar sesiones fotográficas</li>
            <li>Enviar recordatorios y comunicaciones relacionadas con los servicios</li>
            <li>Mantener registros administrativos y contables</li>
            <li>Gestionar el acceso de usuarios al sistema</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Compartir Información</h2>
          <p className="text-foreground leading-relaxed mb-3">
            <strong>No compartimos información personal con terceros</strong>, excepto:
          </p>
          <ul className="list-disc list-inside text-foreground space-y-2">
            <li>Proveedores de servicios necesarios para el funcionamiento de la aplicación (hosting, servicios de email, servicios de WhatsApp Business API)</li>
            <li>Cuando sea requerido por ley o autoridades competentes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Servicios de Terceros</h2>
          <p className="text-foreground leading-relaxed mb-3">Utilizamos los siguientes servicios de terceros que pueden procesar información:</p>
          <ul className="list-disc list-inside text-foreground space-y-2 mb-3">
            <li><strong>WhatsApp Business API (Meta/Facebook)</strong>: Para enviar recordatorios a clientes</li>
            <li><strong>Brevo (Email Service)</strong>: Para enviar comunicaciones por correo electrónico</li>
            <li><strong>Google Calendar API</strong>: Para gestionar calendarios y eventos</li>
            <li><strong>Servicios de Hosting</strong>: Para alojar la aplicación</li>
          </ul>
          <p className="text-foreground leading-relaxed">
            Estos servicios están sujetos a sus propias políticas de privacidad.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">7. Seguridad de los Datos</h2>
          <p className="text-foreground leading-relaxed mb-3">Implementamos medidas de seguridad técnicas y organizativas para proteger la información personal:</p>
          <ul className="list-disc list-inside text-foreground space-y-2">
            <li>Acceso restringido solo a personal autorizado</li>
            <li>Autenticación de usuarios mediante credenciales seguras</li>
            <li>Encriptación de datos sensibles</li>
            <li>Copias de seguridad regulares</li>
            <li>Monitoreo de accesos y actividades</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">8. Retención de Datos</h2>
          <p className="text-foreground leading-relaxed">
            Conservamos la información personal mientras sea necesaria para los fines descritos en esta política o según lo requiera la ley. Los datos de clientes se conservan mientras exista una relación comercial activa y posteriormente según los requisitos legales aplicables.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">9. Derechos de los Usuarios</h2>
          <p className="text-foreground leading-relaxed mb-3">Los usuarios autorizados del sistema tienen derecho a:</p>
          <ul className="list-disc list-inside text-foreground space-y-2 mb-3">
            <li>Acceder a su información personal</li>
            <li>Solicitar correcciones de datos inexactos</li>
            <li>Solicitar la eliminación de su cuenta (sujeto a requisitos legales)</li>
          </ul>
          <p className="text-foreground leading-relaxed">
            Los clientes cuyos datos están en el sistema pueden contactarnos para ejercer sus derechos de privacidad.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies y Tecnologías Similares</h2>
          <p className="text-foreground leading-relaxed mb-3">Esta aplicación utiliza cookies y tecnologías similares para:</p>
          <ul className="list-disc list-inside text-foreground space-y-2">
            <li>Mantener sesiones de usuario autenticadas</li>
            <li>Mejorar la funcionalidad de la aplicación</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">11. Cambios a esta Política</h2>
          <p className="text-foreground leading-relaxed">
            Nos reservamos el derecho de actualizar esta política de privacidad. Cualquier cambio será notificado a los usuarios autorizados del sistema.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contacto</h2>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-foreground leading-relaxed mb-2">
              Para preguntas sobre esta política de privacidad o para ejercer sus derechos, puede contactarnos:
            </p>
            <p className="text-foreground">
              <strong>Cabal Studios</strong><br />
              Email: cabalfotografia@gmail.com
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">13. Cumplimiento Legal</h2>
          <p className="text-foreground leading-relaxed">
            Esta política cumple con las leyes de protección de datos aplicables en Colombia y las regulaciones internacionales relevantes.
          </p>
        </section>

        <hr className="my-8 border-border" />
        <p className="text-muted-foreground italic">
          <strong>Nota:</strong> Esta política de privacidad es específica para una aplicación de gestión interna. Si en el futuro la aplicación se expande para incluir funcionalidades públicas, esta política deberá ser actualizada en consecuencia.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

