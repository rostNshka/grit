import { greet } from '@grit/toolkit';
import { UI_KIT_VERSION } from '@grit/ui-kit';

function App() {
  return (
    <div className="app">
      <h1>Grit Monorepo</h1>
      <p>{greet('world')}</p>
      <p>UI Kit: {UI_KIT_VERSION}</p>
    </div>
  );
}

export default App;