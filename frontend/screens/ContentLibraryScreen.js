import React from 'react';

const ContentLibraryScreen = () => {
  const contents = [
    { id: 1, title: 'Physio Article 1', discipline: 'Physio' },
    { id: 2, title: 'Ophthalmology Article 1', discipline: 'Ophthalmology' },
    { id: 3, title: 'Physio Article 2', discipline: 'Physio' },
    { id: 4, title: 'Ophthalmology Article 2', discipline: 'Ophthalmology' },
  ];

  const filteredContent = contents.filter(content => 
    content.discipline === 'Physio' || content.discipline === 'Ophthalmology'
  );

  return (
    <div>
      <h1>Content Library</h1>
      <ul>
        {filteredContent.map(content => (
          <li key={content.id}>{content.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ContentLibraryScreen;