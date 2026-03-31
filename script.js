document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('json-upload');
    const dragArea = document.getElementById('drag-area');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const boardContainer = document.getElementById('board-container');
    const boardNameEl = document.getElementById('board-name');
    
    // Modal elements
    const modal = document.getElementById('card-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalLabels = document.getElementById('modal-labels');
    const modalListName = document.getElementById('modal-list-name');

    // State
    let trelloData = null;

    // Event Listeners for file upload
    uploadBtn.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and Drop
    dragArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragArea.classList.add('active');
    });

    dragArea.addEventListener('dragleave', () => {
        dragArea.classList.remove('active');
    });

    dragArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragArea.classList.remove('active');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Modal Close
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function handleFile(file) {
        if (!file.name.endsWith('.json')) {
            alert('Please upload a valid JSON file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                processTrelloData(json);
            } catch (err) {
                console.error("Error parsing JSON:", err);
                alert('Invalid JSON file. Please make sure this is a valid Trello JSON export.');
            }
        };
        reader.readAsText(file);
    }

    function processTrelloData(data) {
        trelloData = data;
        
        // Update UI
        boardNameEl.textContent = data.name || 'Trello Board';
        uploadPlaceholder.classList.add('hidden');
        boardContainer.innerHTML = ''; // Clear existing
        
        renderBoard(data);
        
        setTimeout(() => {
            boardContainer.classList.add('visible');
        }, 100);
    }

    function renderBoard(data) {
        const lists = data.lists || [];
        const cards = data.cards || [];
        const labelNames = data.labelNames || {};
        
        // Sort lists by pos (position) if available
        lists.sort((a, b) => (a.pos || 0) - (b.pos || 0));

        // Create a map of lists for easy card assignment
        const listsMap = {};
        lists.forEach(list => {
            if (!list.closed) {
                listsMap[list.id] = {
                    ...list,
                    cards: []
                };
            }
        });

        // Assign cards to lists
        cards.forEach(card => {
            if (!card.closed && card.idList && listsMap[card.idList]) {
                listsMap[card.idList].cards.push(card);
            }
        });

        // Add to DOM
        lists.forEach(list => {
            if (!list.closed && listsMap[list.id]) {
                const listData = listsMap[list.id];
                // sort cards by pos
                listData.cards.sort((a, b) => (a.pos || 0) - (b.pos || 0));
                
                const listEl = createListElement(listData, labelNames);
                boardContainer.appendChild(listEl);
            }
        });
    }

    function createListElement(listData, globalLabelNames) {
        const listDiv = document.createElement('div');
        listDiv.className = 'list';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'list-header';
        headerDiv.innerHTML = `
            <div class="list-title">${escapeHtml(listData.name)}</div>
            <div class="list-count">${listData.cards.length}</div>
        `;
        listDiv.appendChild(headerDiv);

        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'list-cards';

        listData.cards.forEach(card => {
            const cardEl = createCardElement(card, listData.name, globalLabelNames);
            cardsDiv.appendChild(cardEl);
        });

        listDiv.appendChild(cardsDiv);
        return listDiv;
    }

    function createCardElement(card, listName, globalLabelNames) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        // Handle Labels
        let labelsHtml = '';
        if (card.labels && card.labels.length > 0) {
            labelsHtml = '<div class="card-labels">';
            card.labels.forEach(label => {
                const color = label.color || 'default';
                const name = label.name || globalLabelNames[color] || '';
                
                if (name) {
                    labelsHtml += `<span class="card-label-text label-${color}">${escapeHtml(name)}</span>`;
                } else {
                    labelsHtml += `<span class="card-label label-${color}" title="Label"></span>`;
                }
            });
            labelsHtml += '</div>';
        } else if (card.idLabels && card.idLabels.length > 0) {
            // Some exports just have idLabels and we need to look them up from global board.labels
            labelsHtml = '<div class="card-labels">';
            card.idLabels.forEach(idLabel => {
                const labelObj = (trelloData.labels || []).find(l => l.id === idLabel);
                if (labelObj) {
                    const color = labelObj.color || 'default';
                    const name = labelObj.name || '';
                    if (name) {
                        labelsHtml += `<span class="card-label-text label-${color}">${escapeHtml(name)}</span>`;
                    } else {
                        labelsHtml += `<span class="card-label label-${color}" title="Label"></span>`;
                    }
                }
            });
            labelsHtml += '</div>';
        }

        // Meta icons (description, comments)
        let metaHtml = '';
        if (card.badges) {
            if (card.badges.description) {
                metaHtml += `<span class="meta-icon" title="Has description"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg></span>`;
            }
            if (card.badges.comments > 0) {
                metaHtml += `<span class="meta-icon" title="Comments"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> ${card.badges.comments}</span>`;
            }
            if (card.badges.attachments > 0) {
                 metaHtml += `<span class="meta-icon" title="Attachments"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> ${card.badges.attachments}</span>`;
            }
        }

        cardDiv.innerHTML = `
            ${labelsHtml}
            <div class="card-title">${escapeHtml(card.name)}</div>
            ${metaHtml ? `<div class="card-meta">${metaHtml}</div>` : ''}
        `;

        cardDiv.addEventListener('click', () => openModal(card, listName, labelsHtml));

        return cardDiv;
    }

    function openModal(card, listName, labelsHtml) {
        modalTitle.textContent = card.name;
        modalListName.textContent = `In list: ${listName}`;
        modalLabels.innerHTML = labelsHtml || '';
        
        if (card.desc) {
            // Using marked.js if available, otherwise basic formatting
            if (typeof marked !== 'undefined') {
                modalDesc.innerHTML = marked.parse(card.desc);
            } else {
                modalDesc.innerHTML = escapeHtml(card.desc).replace(/\n/g, '<br>');
            }
        } else {
            modalDesc.innerHTML = '<span style="color:var(--text-secondary);font-style:italic;">No description provided.</span>';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
