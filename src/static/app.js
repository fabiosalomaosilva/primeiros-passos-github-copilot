document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        
        // Create participants list
        const participantsList = details.participants.length > 0 
          ? `<ul class="participants-list">${details.participants.map(participant => 
              `<li class="participant-item">
                <span class="participant-email">${participant}</span>
                <button class="delete-btn" onclick="unsubscribeParticipant('${name}', '${participant}')" title="Desinscrever participante">
                  ✕
                </button>
              </li>`
            ).join('')}</ul>`
          : '<p class="no-participants">Nenhum participante inscrito ainda</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Agenda:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidade:</strong> ${spotsLeft} vagas disponíveis</p>
          <div class="participants-section">
            <h5>Participantes Inscritos:</h5>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Por favor, tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na inscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na inscrição:", error);
    }
  });

  // Function to unsubscribe a participant from an activity
  async function unsubscribeParticipant(activityName, email) {
    if (!confirm(`Tem certeza que deseja desinscrever ${email} de ${activityName}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unsubscribe?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        
        // Refresh activities to show updated list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na desinscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na desinscrição:", error);
    }
  }

  // Make unsubscribeParticipant globally available
  window.unsubscribeParticipant = unsubscribeParticipant;

  // Initialize app
  fetchActivities();
});
