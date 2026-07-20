using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CareerApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JobApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JobTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    LinkedIn = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Portfolio = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ResumeFileName = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    ResumeStoredPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JobPostings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmploymentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Responsibilities = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Requirements = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Keywords = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    PostedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobPostings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "JobPostings",
                columns: new[] { "Id", "Department", "EmploymentType", "IsActive", "Keywords", "Location", "PostedDate", "Requirements", "Responsibilities", "Summary", "Title" },
                values: new object[,]
                {
                    { 1, "engineering", "Full-time", true, "mechanical design cfd turbine blade hydrodynamics solidworks ansys", "Roorkee, Uttarakhand", new DateTime(2026, 7, 15, 0, 0, 0, 0, DateTimeKind.Utc), "B.Tech / M.Tech in Mechanical Engineering with 5+ years experience||Proficiency in SolidWorks, ANSYS, and CFD simulation tools||Experience in fluid-structure interaction (FSI) analysis preferred||Knowledge of hydropower, marine, or wind turbine design is a plus||Strong technical writing and cross-functional communication skills", "Design turbine blade profiles and housing geometries for optimal hydrodynamic performance||Conduct CFD simulations (ANSYS Fluent, OpenFOAM) and FEA stress analysis||Oversee prototyping, field testing, and design iteration cycles||Collaborate with IIT Roorkee on hydrodynamic validation studies||Prepare technical documentation for CEA and MNRE submissions", "Lead the design and optimization of hydrokinetic turbine blades, housings, and modular array structures using CFD and FEA tools.", "Senior Mechanical Design Engineer" },
                    { 2, "engineering", "Full-time", true, "electrical power electronics generator inverter grid scada plc", "Roorkee, Uttarakhand", new DateTime(2026, 7, 11, 0, 0, 0, 0, DateTimeKind.Utc), "B.Tech / M.Tech in Electrical Engineering with 3+ years experience||Experience with power electronics, inverters, and grid-tied systems||Proficiency in PLC programming and SCADA platforms (Ignition, WinCC)||Knowledge of IEEE 1547, CEA grid standards, and energy metering||Willingness to travel to remote project sites", "Design low-voltage generator and power conversion systems (50 kW - 1 MW)||Develop grid synchronization, protection, and metering solutions||Build SCADA and remote monitoring architectures for field deployments||Ensure compliance with CEA grid codes and state DISCOM requirements||Support commissioning and troubleshooting at project sites", "Design and integrate generator systems, power electronics, grid interfaces, and SCADA monitoring for SHKT installations.", "Electrical Systems Engineer" },
                    { 3, "engineering", "Full-time", true, "civil structural foundation anchor mooring waterway construction", "Roorkee / Field Sites", new DateTime(2026, 7, 13, 0, 0, 0, 0, DateTimeKind.Utc), "B.Tech / M.Tech in Civil Engineering with 3+ years experience||Experience in water resource or marine structure design||Proficiency in STAAD.Pro, AutoCAD, and site surveying tools||Knowledge of hydrology, soil mechanics, and fluid forces||Field-ready - comfortable working at remote river and canal sites", "Design turbine mounting, anchoring, and mooring structures||Analyze hydrological and geotechnical site conditions||Prepare BOQ, tender documents, and construction drawings||Oversee on-site civil works and installation supervision||Ensure structural safety under flood and debris conditions", "Design anchoring, mooring, and foundation systems for turbine deployment in rivers, canals, and discharge channels.", "Civil & Structural Engineer" },
                    { 4, "operations", "Full-time", true, "project manager site execution commissioning hydro renewable energy", "Pan-India / International", new DateTime(2026, 7, 16, 0, 0, 0, 0, DateTimeKind.Utc), "B.Tech in Engineering with 6+ years in renewable energy project management||Proven track record of executing hydro, solar, or wind projects||PMP or equivalent project management certification preferred||Strong vendor management and government liaison skills||Willingness to relocate and travel extensively across India and abroad", "Manage project timelines, budgets, and stakeholder coordination||Oversee site surveys, civil works, and turbine installation||Coordinate with DISCOMs, state nodal agencies, and local authorities||Ensure HSE compliance and quality assurance at all project stages||Prepare progress reports and milestone documentation for clients", "Lead end-to-end project execution from site survey and civil works to turbine commissioning and handover.", "Project Manager — Site Execution" },
                    { 5, "operations", "Full-time", true, "o&m maintenance technician field service turbine repair", "Pan-India", new DateTime(2026, 7, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Diploma / ITI in Electrical or Mechanical with 2+ years field experience||Experience in hydro, solar, or industrial maintenance preferred||Basic electrical troubleshooting and mechanical repair skills||Comfortable working in outdoor, remote, and water-adjacent environments||Valid driver's license and willingness to travel extensively", "Conduct preventive and corrective maintenance on turbine units||Monitor power output, vibration, and operational parameters||Replace worn components and perform underwater inspections||Maintain spare parts inventory and service logs||Report site conditions and performance data to central operations", "Perform routine maintenance, troubleshooting, and performance monitoring at SHKT project sites nationwide.", "O&M Technician — Field Operations" },
                    { 6, "business", "Full-time", true, "business development sales bde renewable energy hydropower clients", "New Delhi / Remote", new DateTime(2026, 7, 14, 0, 0, 0, 0, DateTimeKind.Utc), "MBA or B.Tech with 4+ years in B2B sales or business development||Experience in energy, infrastructure, or industrial sectors||Strong network in state energy departments and utility companies||Excellent presentation, negotiation, and CRM skills||Willingness to travel domestically and internationally", "Identify and pursue new business opportunities in hydro and renewable energy||Build relationships with state DISCOMs, PSUs, IPPs, and industrial clients||Prepare proposals, feasibility presentations, and commercial bids||Represent MACLEC at industry conferences, trade shows, and government forums||Collaborate with engineering to scope projects and validate site potential", "Drive revenue growth by identifying new project opportunities, building client relationships, and closing deals across India and international markets.", "Business Development Manager" },
                    { 7, "business", "Full-time", true, "grant funding proposal writer government mnre cea subsidy", "New Delhi / Roorkee", new DateTime(2026, 7, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Master's in Public Policy, Energy, or related field with 3+ years experience||Deep understanding of India's renewable energy policy landscape||Proven track record of securing government grants or subsidies||Exceptional technical writing and stakeholder management skills||Network within MNRE, CEA, NITI Aayog, or state nodal agencies", "Identify and apply for government grants, subsidies, and R&D funding||Maintain relationships with MNRE, CEA, DSIR, and state energy departments||Draft policy briefs, white papers, and regulatory submissions||Track policy changes and advise leadership on strategic positioning||Support certification, compliance, and recognition processes", "Secure government funding, subsidies, and policy support by navigating MNRE, CEA, DSIR, and state nodal agency frameworks.", "Government Relations & Grants Specialist" },
                    { 8, "research", "Full-time", true, "research scientist hydrodynamics cfd materials corrosion renewable", "Roorkee, Uttarakhand", new DateTime(2026, 7, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Ph.D. in Fluid Mechanics, Ocean Engineering, or related field||Expertise in CFD (OpenFOAM, ANSYS Fluent, Star-CCM+)||Publication record in hydrodynamics or renewable energy journals||Experience with experimental hydraulics and flow measurement||Passion for translating research into commercial technology", "Conduct CFD and experimental studies on turbine hydrodynamic performance||Research wake recovery, array interaction, and channel blockage effects||Develop predictive models for power output under varying flow conditions||Publish findings in peer-reviewed journals and present at conferences||Collaborate with IIT Roorkee and international research partners", "Lead fundamental and applied research on hydrokinetic turbine performance, wake dynamics, and aquatic environmental interaction.", "Research Scientist — Hydrodynamics" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobApplications");

            migrationBuilder.DropTable(
                name: "JobPostings");
        }
    }
}
