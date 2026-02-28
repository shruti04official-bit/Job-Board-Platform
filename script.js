// Fetch all jobs from backend
async function renderJobs() {
    const container = document.getElementById("jobContainer");
    const search = document.getElementById("searchInput").value.toLowerCase();

    container.innerHTML = "";

    try {
        const res = await fetch("http://127.0.0.1:8000/jobs");
        let jobs = await res.json();

        const filteredJobs = jobs.filter(job =>
            job.title.toLowerCase().includes(search) ||
            job.company.toLowerCase().includes(search)
        );

        if (filteredJobs.length === 0) {
            container.innerHTML = `<p class="text-center">No jobs found</p>`;
            return;
        }

        filteredJobs.forEach((job) => {
            container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card p-4">
                    <h5>${job.title}</h5>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Applicants:</strong> ${job.applied}</p>

                    <div class="mb-2">
                        ${job.skills.map(skill =>
                            `<span class="badge bg-info text-dark me-1">${skill}</span>`
                        ).join("")}
                    </div>

                    <button onclick="applyJob(${job.id})"
                            class="btn btn-success w-100 mb-2">
                        Apply
                    </button>
                </div>
            </div>
            `;
        });
    } catch (err) {
        container.innerHTML = `<p class="text-center text-danger">Error loading jobs</p>`;
        console.error(err);
    }
}

// Add job to backend
document.getElementById("postForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById("role").value,
        company: document.getElementById("company").value,
        location: document.getElementById("location").value,
        skills: document.getElementById("skills").value
    };

    try {
        await fetch("http://127.0.0.1:8000/jobs", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        this.reset();
        renderJobs(); // Refresh job list
    } catch (err) {
        console.error(err);
    }
});

// Apply to job
async function applyJob(id) {
    try {
        await fetch(`http://127.0.0.1:8000/jobs/${id}/apply`, { method: "POST" });
        renderJobs(); // Refresh applicants count
        alert("Applied Successfully!");
    } catch (err) {
        console.error(err);
    }
}

// Resume match
async function analyzeResume() {
    const input = document.getElementById("resumeUpload");
    if (!input.files[0]) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("file", input.files[0]);

    try {
        const res = await fetch("http://127.0.0.1:8000/match", {
            method: "POST",
            body: formData
        });
        const matches = await res.json();

        const container = document.getElementById("matchResults");
        container.innerHTML = matches.map(job => `
            <div class="card p-3 mb-3">
                <h6>${job.title} (${job.company})</h6>
                <div class="progress">
                    <div class="progress-bar bg-success" style="width:${job.match_score}%">
                        ${job.match_score}% Match
                    </div>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error(err);
    }
}

document.getElementById("searchInput")
    .addEventListener("input", renderJobs);

// Initial load
renderJobs();