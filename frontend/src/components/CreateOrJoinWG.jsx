import React, { useState } from 'react';

const CreateOrJoinWG = () => {
    const [wgName, setWgName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const handleCreateWG = () => {
        // Logik für das Erstellen einer neuen WG hinzufügen (API-Aufruf)
        console.log("Neue WG erstellen:", wgName);
    };

    const handleJoinWG = () => {
        // Logik für das Beitreten einer bestehenden WG hinzufügen (API-Aufruf)
        console.log("WG beitreten mit Code:", joinCode);
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Wähle eine Option</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>Neue WG erstellen</h3>
                <input
                    type="text"
                    placeholder="Name der WG"
                    value={wgName}
                    onChange={(e) => setWgName(e.target.value)}
                />
                <button onClick={handleCreateWG}>Erstellen</button>
            </div>

            <div>
                <h3>WG beitreten</h3>
                <input
                    type="text"
                    placeholder="Einladungscode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                />
                <button onClick={handleJoinWG}>Beitreten</button>
            </div>
        </div>
    );
};

export default CreateOrJoinWG;
