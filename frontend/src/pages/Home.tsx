import { useAuth } from "@/hooks/useAuth";

function Home() {
  const { user } = useAuth();

  return (
    <article>
      <header>
        <h1>Bienvenido</h1>
      </header>
      <p>
        Hola, <strong>{user?.name || user?.email}</strong>. Has iniciado sesión
        correctamente en el sistema de gestión de fotografía.
      </p>
      <p>Desde aquí podrás gestionar clientes, facturas, sesiones y pagos.</p>
    </article>
  );
}

export default Home;
