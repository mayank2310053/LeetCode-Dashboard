document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");

    const statsContainer = document.querySelector(".stats-container");

    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    const cardStatsContainer =
        document.querySelector(".stats-cards");

    function validateUsername(username) {

        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }

        const regex = /^[a-zA-Z0-9_-]{1,30}$/;

        if (!regex.test(username)) {
            alert("Invalid LeetCode Username");
            return false;
        }

        return true;
    }

    function updateProgress(
        solved,
        total,
        label,
        circle
    ) {

        const progressDegree =
            total === 0
                ? 0
                : (solved / total) * 100;

        circle.style.background =
            `conic-gradient(
                currentColor ${progressDegree}%,
                #1e293b 0%
            )`;

        label.textContent =
            `${solved}/${total}`;
    }

    function displayUserData(parsedData) {

        statsContainer.classList.remove("hidden");

        const totalEasyQues =
            parsedData.data.allQuestionsCount[1].count;

        const totalMediumQues =
            parsedData.data.allQuestionsCount[2].count;

        const totalHardQues =
            parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues =
            parsedData.data.matchedUser.submitStats
                .acSubmissionNum[0].count;

        const solvedEasyQues =
            parsedData.data.matchedUser.submitStats
                .acSubmissionNum[1].count;

        const solvedMediumQues =
            parsedData.data.matchedUser.submitStats
                .acSubmissionNum[2].count;

        const solvedHardQues =
            parsedData.data.matchedUser.submitStats
                .acSubmissionNum[3].count;

        updateProgress(
            solvedEasyQues,
            totalEasyQues,
            easyLabel,
            easyProgressCircle
        );

        updateProgress(
            solvedMediumQues,
            totalMediumQues,
            mediumLabel,
            mediumProgressCircle
        );

        updateProgress(
            solvedHardQues,
            totalHardQues,
            hardLabel,
            hardProgressCircle
        );

        const cardsData = [

            {
                label: "Solved Problems",
                value: solvedTotalQues,
            },

            {
                label: "Overall Submissions",
                value:
                    parsedData.data.matchedUser
                        .submitStats
                        .totalSubmissionNum[0]
                        .submissions,
            },

            {
                label: "Easy Submissions",
                value:
                    parsedData.data.matchedUser
                        .submitStats
                        .totalSubmissionNum[1]
                        .submissions,
            },

            {
                label: "Medium Submissions",
                value:
                    parsedData.data.matchedUser
                        .submitStats
                        .totalSubmissionNum[2]
                        .submissions,
            },

            {
                label: "Hard Submissions",
                value:
                    parsedData.data.matchedUser
                        .submitStats
                        .totalSubmissionNum[3]
                        .submissions,
            }

        ];

        cardStatsContainer.innerHTML =
            cardsData.map(card => `
                <div class="card">
                    <h3>${card.label}</h3>
                    <p>${card.value}</p>
                </div>
            `).join("");
    }

    async function fetchUserDetails(username) {

        try {

            searchButton.textContent =
                "Searching...";

            searchButton.disabled = true;

            const query = `
            query getUserProfile($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }

                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }

                        totalSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }
            `;

            const response = await fetch(
                "https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        query,
                        variables: {
                            username
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch data"
                );
            }

            const parsedData =
                await response.json();

            console.log(parsedData);

            if (
                !parsedData.data ||
                !parsedData.data.matchedUser
            ) {
                throw new Error(
                    "User not found"
                );
            }

            displayUserData(parsedData);

        }
        catch (error) {

            console.error(error);

            cardStatsContainer.innerHTML = `
                <div class="card">
                    <h3>Error</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
        finally {

            searchButton.textContent =
                "Search";

            searchButton.disabled = false;
        }
    }

    searchButton.addEventListener(
        "click",
        function () {

            const username =
                usernameInput.value.trim();

            if (
                validateUsername(username)
            ) {
                fetchUserDetails(username);
            }
        }
    );

    usernameInput.addEventListener(
        "keypress",
        function (e) {

            if (e.key === "Enter") {
                searchButton.click();
            }
        }
    );

});