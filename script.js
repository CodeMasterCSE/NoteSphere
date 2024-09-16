document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Sample data
    let folders = [
        { id: 1, name: 'Movie Review', color: '#dbeafe', date: '15-03-2023' },
        { id: 2, name: 'Class Notes', color: '#fee2e2', date: '10-03-2023' },
        { id: 3, name: 'Book Lists', color: '#fef9c3', date: '05-03-2023' },
        { id: 4, name: 'Project Ideas', color: '#dcfce7', date: '01-03-2023' },
    ];

    let notes = [
        { id: 1, title: 'Mid test exam', color: '#fef9c3', date: '15-03-2023', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', folderId: null },
        { id: 2, title: 'Mid test exam', color: '#fee2e2', date: '15-03-2023', content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', folderId: null },
        { id: 3, title: "Jonas's notes", color: '#dbeafe', date: '15-03-2023', content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.', folderId: null },
        { id: 4, title: 'Project brainstorm', color: '#dcfce7', date: '16-03-2023', content: 'Brainstorming session for new project ideas.', folderId: null },
    ];

    let trash = [];

    const renderFolders = (filter = 'All') => {
        const foldersGrid = document.getElementById('foldersGrid');
        foldersGrid.innerHTML = '';
        const filteredFolders = filterItems(folders, filter);
        filteredFolders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder';
            folderElement.style.backgroundColor = folder.color;
            folderElement.innerHTML = `
                <div class="folder-title">
                    <span>
                        <svg class="folder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${folder.name}
                    </span>
                    <button class="delete-button" data-id="${folder.id}"><i data-lucide="trash-2"></i></button>
                </div>
                <div class="folder-date">${folder.date}</div>
            `;
            folderElement.setAttribute('data-folder-id', folder.id);
            foldersGrid.appendChild(folderElement);

            // Add click event listener to open folder dialog
            folderElement.addEventListener('click', () => openFolderDialog(folder));

            // Add drag and drop event listeners
            folderElement.addEventListener('dragover', (e) => {
                e.preventDefault();
                folderElement.classList.add('drag-over');
            });

            folderElement.addEventListener('dragleave', () => {
                folderElement.classList.remove('drag-over');
            });

            folderElement.addEventListener('drop', (e) => {
                e.preventDefault();
                folderElement.classList.remove('drag-over');
                const noteId = parseInt(e.dataTransfer.getData('text/plain'));
                moveNoteToFolder(noteId, folder.id);
            });
        });

        // Add "New Folder" button
        const newFolderButton = document.createElement('div');
        newFolderButton.className = 'new-item';
        newFolderButton.innerHTML = `
            <i data-lucide="folder-plus"></i>
            <span>New Folder</span>
        `;
        newFolderButton.addEventListener('click', () => {
            openAddFolderModal();
        });
        foldersGrid.appendChild(newFolderButton);
        lucide.createIcons();

        // Add delete event listeners
        document.querySelectorAll('.folder .delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = parseInt(button.dataset.id);
                const folderIndex = folders.findIndex(f => f.id === folderId);
                if (folderIndex !== -1) {
                    const deletedFolder = folders.splice(folderIndex, 1)[0];
                    trash.push({ ...deletedFolder, type: 'folder' });
                    renderFolders();
                    renderAllNotesAndFolders(); // Update the sidebar
                }
            });
        });
    };

    const renderNotes = (filter = 'All') => {
        const notesGrid = document.getElementById('notesGrid');
        notesGrid.innerHTML = '';
        const filteredNotes = filterItems(notes, filter);
        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.style.backgroundColor = note.color;
            noteElement.draggable = true; // Make note draggable
            noteElement.innerHTML = `
                <div class="note-title">
                    <span>${note.title}</span>
                    <button class="delete-button" data-id="${note.id}"><i data-lucide="trash-2"></i></button>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-date">${note.date}</div>
                <div class="note-actions">
                    <button class="edit-button" data-id="${note.id}"><i data-lucide="edit-3"></i></button>
                </div>
            `;
            noteElement.setAttribute('data-note-id', note.id);
            notesGrid.appendChild(noteElement);

            // Add drag start event listener
            noteElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', note.id);
            });
        });

        // Add "New Note" button
        const newNoteButton = document.createElement('div');
        newNoteButton.className = 'new-item';
        newNoteButton.innerHTML = `
            <i data-lucide="file-plus"></i>
            <span>New Note</span>
        `;
        newNoteButton.addEventListener('click', () => {
            openAddNoteModal();
        });
        notesGrid.appendChild(newNoteButton);
        lucide.createIcons();

        // Add delete event listeners
        document.querySelectorAll('.note .delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = parseInt(button.dataset.id);
                const noteIndex = notes.findIndex(n => n.id === noteId);
                if (noteIndex !== -1) {
                    const deletedNote = notes.splice(noteIndex, 1)[0];
                    trash.push({ ...deletedNote, type: 'note' });
                    renderNotes();
                    renderAllNotesAndFolders(); // Update the sidebar
                }
            });
        });

        // Add edit event listeners
        document.querySelectorAll('.note .edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = parseInt(button.dataset.id);
                const note = notes.find(n => n.id === noteId);
                if (note) {
                    openEditNoteModal(note);
                }
            });
        });
    };

    const folderTabs = document.querySelectorAll('.folders-section .tab');
    const noteTabs = document.querySelectorAll('.notes-section .tab');

    folderTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            folderTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFolders(tab.dataset.tab);
        });
    });

    noteTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            noteTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderNotes(tab.dataset.tab);
        });
    });

    function filterItems(items, filter) {
        if (filter === 'All') {
            return items;
        }

        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        return items.filter(item => {
            const itemDate = parseDate(item.date);
            switch (filter) {
                case 'Today':
                    return isSameDay(itemDate, today);
                case 'This Week':
                    return itemDate >= oneWeekAgo;
                case 'This Month':
                    return itemDate >= oneMonthAgo;
                default:
                    return true;
            }
        });
    }

    function parseDate(dateString) {
        const [day, month, year] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Initial render
    renderFolders('All');
    renderNotes('All');

    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Add New Note functionality
    const noteModal = document.getElementById('addNoteModal');
    const addNewNoteButton = document.getElementById('addNewNoteButton');
    const saveNoteButton = document.getElementById('saveNote');
    const cancelNoteButton = document.getElementById('cancelNote');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const noteColorOptions = document.querySelectorAll('#addNoteModal .color-option');

    let selectedNoteColor = '#dbeafe';

    addNewNoteButton.addEventListener('click', () => {
        openAddNoteModal();
    });

    cancelNoteButton.addEventListener('click', () => {
        noteModal.style.display = 'none';
        resetNoteModalInputs();
    });

    noteColorOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedNoteColor = option.dataset.color;
            noteColorOptions.forEach(opt => opt.style.border = 'none');
            option.style.border = '2px solid #3b82f6';
        });
    });

    saveNoteButton.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if (title && content) {
            const newNote = {
                id: Date.now(),
                title: title,
                content: content,
                color: selectedNoteColor,
                date: formatDate(new Date()),
                folderId: null
            };
            notes.unshift(newNote);
            renderNotes();
            renderAllNotesAndFolders(); // Update the sidebar
            noteModal.style.display = 'none';
            resetNoteModalInputs();
        }
    });

    function resetNoteModalInputs() {
        const modalTitle = document.getElementById('addNoteModal').querySelector('h2');
        modalTitle.textContent = 'Add New Note';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        selectedNoteColor = '#dbeafe';
        noteColorOptions.forEach(opt => opt.style.border = 'none');
        noteColorOptions[0].style.border = '2px solid #3b82f6';

        // Reset the save button onclick event
        const saveNoteButton = document.getElementById('saveNote');
        saveNoteButton.onclick = null;
    }

    // Add New Folder functionality
    const folderModal = document.getElementById('addFolderModal');
    const addNewFolderButton = document.getElementById('addNewFolderButton');
    const saveFolderButton = document.getElementById('saveFolder');
    const cancelFolderButton = document.getElementById('cancelFolder');
    const folderNameInput = document.getElementById('folderName');
    const folderColorOptions = document.querySelectorAll('#addFolderModal .color-option');

    let selectedFolderColor = '#dbeafe';

    addNewFolderButton.addEventListener('click', () => {
        openAddFolderModal();
    });

    cancelFolderButton.addEventListener('click', () => {
        folderModal.style.display = 'none';
        resetFolderModalInputs();
    });

    folderColorOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedFolderColor = option.dataset.color;
            folderColorOptions.forEach(opt => opt.style.border = 'none');
            option.style.border = '2px solid #3b82f6';
        });
    });

    saveFolderButton.addEventListener('click', () => {
        const name = folderNameInput.value.trim();
        if (name) {
            const newFolder = {
                id: Date.now(),
                name: name,
                color: selectedFolderColor,
                date: formatDate(new Date())
            };
            folders.unshift(newFolder);
            renderFolders();
            renderAllNotesAndFolders(); // Update the sidebar
            folderModal.style.display = 'none';
            resetFolderModalInputs();
        }
    });

    // Add this new event listener
    folderNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            saveFolderButton.click(); // Trigger the save button click
        }
    });

    function resetFolderModalInputs() {
        folderNameInput.value = '';
        selectedFolderColor = '#dbeafe';
        folderColorOptions.forEach(opt => opt.style.border = 'none');
        folderColorOptions[0].style.border = '2px solid #3b82f6';
    }

    function openEditNoteModal(note) {
        const noteModal = document.getElementById('addNoteModal');
        const modalTitle = noteModal.querySelector('h2');
        const noteTitleInput = document.getElementById('noteTitle');
        const noteContentInput = document.getElementById('noteContent');
        const noteColorOptions = document.querySelectorAll('#addNoteModal .color-option');
        const saveNoteButton = document.getElementById('saveNote');

        modalTitle.textContent = 'Edit Note';
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        selectedNoteColor = note.color;
        noteColorOptions.forEach(opt => {
            opt.style.border = opt.dataset.color === note.color ? '2px solid #3b82f6' : 'none';
        });

        saveNoteButton.onclick = () => {
            const updatedNote = {
                ...note,
                title: noteTitleInput.value.trim(),
                content: noteContentInput.value.trim(),
                color: selectedNoteColor,
                folderId: null
            };
            const index = notes.findIndex(n => n.id === note.id);
            if (index !== -1) {
                notes[index] = updatedNote;
                renderNotes();
                renderAllNotesAndFolders(); // Update the sidebar
                noteModal.style.display = 'none';
                resetNoteModalInputs();
            }
        };

        noteModal.style.display = 'block';
    }

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', performSearch);

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const foldersGrid = document.getElementById('foldersGrid');
        const notesGrid = document.getElementById('notesGrid');

        // Filter folders
        const filteredFolders = folders.filter(folder => folder.name.toLowerCase().includes(searchTerm));
        foldersGrid.innerHTML = ''; // Clear existing folders
        filteredFolders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder';
            folderElement.style.backgroundColor = folder.color;
            folderElement.innerHTML = `
                <div class="folder-title">
                    <span>${folder.name}</span>
                </div>
                <div class="folder-date">${folder.date}</div>
            `;
            foldersGrid.appendChild(folderElement);
        });

        // Filter notes
        const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm));
        notesGrid.innerHTML = ''; // Clear existing notes
        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.style.backgroundColor = note.color;
            noteElement.innerHTML = `
                <div class="note-title">
                    <span>${note.title}</span>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-date">${note.date}</div>
            `;
            notesGrid.appendChild(noteElement);
        });
    }

    function renderAllNotesAndFolders() {
        const folderList = document.getElementById('folderList');
        const noteList = document.getElementById('noteList');
        
        folderList.innerHTML = ''; // Clear existing content for folders
        noteList.innerHTML = ''; // Clear existing content for notes

        // Render folders
        folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.innerHTML = `
                <span>${folder.name}</span>
                <button class="delete-button" data-id="${folder.id}"><i data-lucide="trash-2"></i></button>
            `;
            folderList.appendChild(folderElement);

            // Add delete event listener for folders
            folderElement.querySelector('.delete-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const folderId = parseInt(e.target.dataset.id);
                const folderIndex = folders.findIndex(f => f.id === folderId);
                if (folderIndex !== -1) {
                    const deletedFolder = folders.splice(folderIndex, 1)[0];
                    trash.push({ ...deletedFolder, type: 'folder' });
                    renderFolders();
                    renderAllNotesAndFolders(); // Update the sidebar
                }
            });
        });

        // Render notes
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.innerHTML = `
                <span>${note.title}</span>
                <button class="delete-button" data-id="${note.id}"><i data-lucide="trash-2"></i></button>
            `;
            noteList.appendChild(noteElement);

            // Add delete event listener for notes
            noteElement.querySelector('.delete-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = parseInt(e.target.dataset.id);
                const noteIndex = notes.findIndex(n => n.id === noteId);
                if (noteIndex !== -1) {
                    const deletedNote = notes.splice(noteIndex, 1)[0];
                    trash.push({ ...deletedNote, type: 'note' });
                    renderNotes();
                    renderAllNotesAndFolders(); // Update the sidebar
                }
            });
        });
    }

    // Call this function to render notes and folders when the page loads
    renderAllNotesAndFolders();

    const trashButton = document.getElementById('trashButton');
    const trashModal = document.getElementById('trashModal');
    const closeTrashButton = document.getElementById('closeTrash');
    const trashContent = document.getElementById('trashContent');

    trashButton.addEventListener('click', () => {
        renderTrash();
        trashModal.style.display = 'block';
    });

    closeTrashButton.addEventListener('click', () => {
        trashModal.style.display = 'none';
    });

    function renderTrash() {
        trashContent.innerHTML = '';
        
        if (trash.length === 0) {
            trashContent.innerHTML = '<p>Trash is empty</p>';
            return;
        }

        // Create separate containers for notes and folders
        const notesContainer = document.createElement('div');
        notesContainer.className = 'trash-notes';
        const foldersContainer = document.createElement('div');
        foldersContainer.className = 'trash-folders';

        // Add headers
        notesContainer.innerHTML = '<h3><i data-lucide="file-text"></i> Deleted Notes</h3>';
        foldersContainer.innerHTML = '<h3><i data-lucide="folder"></i> Deleted Folders</h3>';

        trash.forEach((item, index) => {
            const trashItem = document.createElement('div');
            trashItem.className = 'trash-item';
            
            if (item.type === 'note') {
                trashItem.innerHTML = `
                    <div class="trash-item-content">
                        <span><i data-lucide="file-text"></i> ${item.title}</span>
                        <p>Deleted on: ${item.date}</p> <!-- Displaying the date instead of content -->
                    </div>
                    <button class="restore-button" data-index="${index}">Restore</button>
                `;
                notesContainer.appendChild(trashItem);
            } else if (item.type === 'folder') {
                trashItem.innerHTML = `
                    <div class="trash-item-content">
                        <span><i data-lucide="folder"></i> ${item.name}</span>
                        <p>Created on: ${item.date}</p>
                    </div>
                    <button class="restore-button" data-index="${index}">Restore</button>
                `;
                foldersContainer.appendChild(trashItem);
            }
        });

        trashContent.appendChild(notesContainer);
        trashContent.appendChild(foldersContainer);

        // Initialize Lucide icons
        lucide.createIcons();

        // Add restore event listeners
        document.querySelectorAll('.restore-button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                const restoredItem = trash.splice(index, 1)[0];
                if (restoredItem.type === 'folder') {
                    folders.unshift(restoredItem);
                    renderFolders();
                } else {
                    notes.unshift(restoredItem);
                    renderNotes();
                }
                renderTrash();
                renderAllNotesAndFolders();
            });
        });
    }

    // Function to open folder dialog
    function openFolderDialog(folder) {
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content" style="outline: none;">
                <h2>${folder.name}</h2>
                <div id="folderNotes" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;"></div>
                <div class="modal-actions" style="margin-top: 20px;">
                    <button id="closeFolderDialog" style="outline: none;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        const folderNotes = document.getElementById('folderNotes');
        const notesInFolder = notes.filter(note => note.folderId === folder.id);

        if (notesInFolder.length === 0) {
            folderNotes.innerHTML = '<p>No notes in this folder</p>';
        } else {
            notesInFolder.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                noteElement.style.backgroundColor = note.color;
                noteElement.style.padding = '10px';
                noteElement.style.borderRadius = '8px';
                noteElement.style.outline = 'none';
                noteElement.innerHTML = `
                    <div class="note-title">
                        <span>${note.title}</span>
                    </div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-date">${note.date}</div>
                `;
                folderNotes.appendChild(noteElement);
            });
        }

        const closeButton = document.getElementById('closeFolderDialog');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.style.display = 'block';

        // Add a click event listener to the dialog to prevent closing when clicking inside
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    function moveNoteToFolder(noteId, folderId) {
        const noteIndex = notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            notes[noteIndex].folderId = folderId;
            renderNotes();
            renderAllNotesAndFolders();
        }
    }

    // Close modal when clicking outside of it
    noteModal.addEventListener('click', (event) => {
        if (event.target === noteModal) {
            noteModal.style.display = 'none';
        }
    });

    folderModal.addEventListener('click', (event) => {
        if (event.target === folderModal) {
            folderModal.style.display = 'none';
        }
    });

    trashModal.addEventListener('click', (event) => {
        if (event.target === trashModal) {
            trashModal.style.display = 'none';
        }
    });

    function openAddNoteModal() {
        const noteModal = document.getElementById('addNoteModal');
        noteModal.style.display = 'block';

        // Close modal when clicking outside of it
        noteModal.addEventListener('click', (event) => {
            if (event.target === noteModal) {
                noteModal.style.display = 'none';
            }
        });

        const closeButton = document.getElementById('cancelNote');
        closeButton.addEventListener('click', () => {
            noteModal.style.display = 'none';
        });
    }

    function openAddFolderModal() {
        const folderModal = document.getElementById('addFolderModal');
        folderModal.style.display = 'block';

        // Close modal when clicking outside of it
        folderModal.addEventListener('click', (event) => {
            if (event.target === folderModal) {
                folderModal.style.display = 'none';
            }
        });

        const closeButton = document.getElementById('cancelFolder');
        closeButton.addEventListener('click', () => {
            folderModal.style.display = 'none';
        });
    }

    function openTrashModal() {
        const trashModal = document.getElementById('trashModal');
        trashModal.style.display = 'block';

        // Close modal when clicking outside of it
        trashModal.addEventListener('click', (event) => {
            if (event.target === trashModal) {
                trashModal.style.display = 'none';
            }
        });

        const closeButton = document.getElementById('closeTrash');
        closeButton.addEventListener('click', () => {
            trashModal.style.display = 'none';
        });
    }
});
