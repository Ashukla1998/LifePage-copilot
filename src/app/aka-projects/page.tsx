// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { FiEdit2, FiPlus, FiSearch, FiCheck, FiSlash } from 'react-icons/fi';
// import { AkaProjects } from './types';
// import AddProjectModal, { AkaProjectsPayload } from './components/AddProject';
// import EditProjectModal, { AkaProjectsEditFormData } from './components/EditProjectModal';
// import StatusModal from './components/StatusModal';

// export default function AkaProjectsPage() {
//   const [projects, setprojects] = useState<AkaProjects[]>([]);
//   const [search, setSearch] = useState('');
//   const [selectedProject, setSelectedProject] = useState<AkaProjects | null>(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

//   // Fetch initial project list
//   useEffect(() => {
//     const fetchprojects = async () => {
//       try {
//         const response = await fetch('https://www.lifepage.in/n/api/GetProjects');

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();

//         if (result?.success === 1 && result.data) {
//           setprojects(Array.isArray(result.data) ? result.data : [result.data]);
//         } else {
//           setprojects([]);
//         }
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//         setprojects([]);
//       }
//     };

//     fetchprojects();
//   }, []); // Run once on mount

//   // Add project handler
//   const handleAddProject = async (payload: AkaProjectsPayload) => {
//     try {
//       const res = await fetch('https://www.lifepage.in/n/api/AkaProject', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (result.success === 1 && result.data) {
//         setprojects((prev) => [result.data, ...prev]);
//         setIsAddModalOpen(false);
//       } else {
//         alert(result.message || 'Failed to create project');
//       }
//     } catch (err) {
//       console.error('Error adding project:', err);
//     }
//   };

//   // Open Edit Modal
//   const handleOpenEdit = (project: AkaProjects) => {
//     setSelectedProject(project);
//     setIsEditModalOpen(true);
//   };

//   // Submit Edit Project
//   const handleEditProject = async (projectid: number, formData: AkaProjectsEditFormData) => {
//     try {
//       // If you have an edit API, call it here:
//       // const res = await fetch('https://www.lifepage.in/n/api/EditProject', {
//       //   method: 'PUT',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ projectid, ...formData }),
//       // });
//       // const result = await res.json();

//       setprojects((prev) =>
//         prev.map((item) => {
//           if (item.projectid === projectid) {
//             return {
//               ...item,
//               ...formData,
//               cover: formData.cover ? URL.createObjectURL(formData.cover) : item.cover,
//             };
//           }
//           return item;
//         })
//       );
//       setIsEditModalOpen(false);
//     } catch (err) {
//       console.error('Error updating project:', err);
//     }
//   };

//   // Open Status Modal
//   const handleOpenStatusModal = (project: AkaProjects) => {
//     setSelectedProject(project);
//     setIsStatusModalOpen(true);
//   };

//   const handleStatusSuccess = (updatedProject: AkaProjects) => {
//     setprojects((prev) =>
//       prev.map((p) => (String(p.projectid) === String(updatedProject.projectid) ? updatedProject : p))
//     );
//   };

//   const ProjectList = Array.isArray(projects) ? projects : [];
//   const filteredprojects = ProjectList.filter(
//     (m) =>
//       m.title?.toLowerCase().includes(search.toLowerCase()) ||
//       m.category?.toLowerCase().includes(search.toLowerCase()) ||
//       m.description?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <main className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Top Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//               AKA projects
//             </h1>
//             <p className="text-sm text-slate-500 mt-1">
//               Manage Projects.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() => setIsAddModalOpen(true)}
//             className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow active:scale-95"
//           >
//             <FiPlus className="text-base" />
//             Add Project
//           </button>
//         </div>

//         {/* Card Table Container */}
//         <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
//           {/* Search Bar */}
//           <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
//             <div className="relative flex-1 max-w-sm">
//               <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by title or category..."
//                 className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
//               />
//             </div>
//             <span className="text-xs font-medium text-slate-400">
//               {filteredprojects.length} {filteredprojects.length === 1 ? 'project' : 'projects'}
//             </span>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm text-slate-600">
//               <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
//                 <tr>
//                   <th scope="col" className="px-6 py-3.5">Project</th>
//                   <th scope="col" className="px-6 py-3.5">Category</th>
//                   <th scope="col" className="px-6 py-3.5">Size</th>
//                   <th scope="col" className="px-6 py-3.5">Buildup</th>
//                   <th scope="col" className="px-6 py-3.5">Services</th>
//                   <th scope="col" className="px-6 py-3.5">Status</th>
//                   <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {filteredprojects.length > 0 ? (
//                   filteredprojects.map((project) => (
//                     <tr key={project.projectid} className="hover:bg-slate-50/80 transition-colors">
//                       {/* Photo & Name */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3.5">
//                           <div className="relative h-11 w-11 shrink-0 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-100">
//                             {project.cover ? (
//                               <Image
//                                 src={project.cover}
//                                 alt={project.title}
//                                 fill
//                                 sizes="44px"
//                                 className="object-cover"
//                                 unoptimized
//                               />
//                             ) : (
//                               <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
//                                 {project.title ? project.title.charAt(0).toUpperCase() : '?'}
//                               </div>
//                             )}
//                           </div>
//                           <div>
//                             <div className="font-semibold text-slate-900 leading-snug">
//                               {project.title}
//                             </div>
//                             <div className="text-xs text-slate-400 line-clamp-1 max-w-50">
//                               {project.description || 'No description provided'}
//                             </div>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Category */}
//                       <td className="px-6 py-4">
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
//                           {project.category || 'General'}
//                         </span>
//                       </td>

//                       {/* Size */}
//                       <td className="px-6 py-4">
//                         <div className="text-slate-800 font-medium text-sm">{project.size || 'N/A'}</div>
//                       </td>

//                       {/* Buildup */}
//                       <td className="px-6 py-4">
//                         <div className="text-slate-800 font-medium text-sm">
//                           {project.buildup || 'N/A'}
//                         </div>
//                       </td>

//                       {/* Services */}
//                       <td className="px-6 py-4">
//                         <div className="text-slate-800 font-medium text-sm">
//                           {project.service || 'N/A'}
//                         </div>
//                       </td>

//                       {/* Status */}
//                       <td className="px-6 py-4">
//                         <span
//                           className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
//                             project.is_active
//                               ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
//                               : 'bg-rose-50 text-rose-700 border border-rose-200/60'
//                           }`}
//                         >
//                           <span
//                             className={`w-1.5 h-1.5 rounded-full ${
//                               project.is_active ? 'bg-emerald-500' : 'bg-rose-500'
//                             }`}
//                           />
//                           {project.is_active ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-6 py-4 text-right">
//                         <div className="inline-flex items-center gap-1">
//                           <button
//                             onClick={() => handleOpenEdit(project)}
//                             className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="Edit project"
//                           >
//                             <FiEdit2 className="w-4 h-4" />
//                           </button>

//                           <button
//                             onClick={() => handleOpenStatusModal(project)}
//                             title={project.is_active ? 'Deactivate project' : 'Activate project'}
//                             className={`p-2 rounded-lg transition-colors ${
//                               project.is_active
//                                 ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
//                                 : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
//                             }`}
//                           >
//                             {project.is_active ? (
//                               <FiSlash className="w-4 h-4" />
//                             ) : (
//                               <FiCheck className="w-4 h-4" />
//                             )}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
//                       No projects found matching &quot;{search}&quot;.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <AddProjectModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         onSubmit={handleAddProject}
//       />

//       <EditProjectModal
//         isOpen={isEditModalOpen}
//         project={selectedProject}
//         onClose={() => {
//           setIsEditModalOpen(false);
//           setSelectedProject(null);
//         }}
//         onSubmit={handleEditProject}
//       />

//       <StatusModal
//         isOpen={isStatusModalOpen}
//         project={selectedProject}
//         onClose={() => setIsStatusModalOpen(false)}
//         onSuccess={handleStatusSuccess}
//       />
//     </main>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiEdit2, FiPlus, FiSearch, FiCheck, FiSlash } from 'react-icons/fi';
import { AkaProjects } from './types';
import AddProjectModal, { AkaProjectsPayload } from './components/AddProject';
import EditProjectModal, { AkaProjectsEditFormData } from './components/EditProjectModal';
import StatusModal from './components/StatusModal';

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function AkaProjectsPage() {
  const [projects, setprojects] = useState<AkaProjects[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<AkaProjects | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Fetch initial project list
  useEffect(() => {
    const fetchprojects = async () => {
      try {
        const response = await fetch('https://www.lifepage.in/n/api/GetProjects');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success === 1 && result.data) {
          setprojects(Array.isArray(result.data) ? result.data : [result.data]);
        } else {
          setprojects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setprojects([]);
      }
    };

    fetchprojects();
  }, []); // Run once on mount

  // Add project handler
  const handleAddProject = async (payload: AkaProjectsPayload) => {
    try {
      const res = await fetch('https://www.lifepage.in/n/api/AkaProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success === 1 && result.data) {
        setprojects((prev) => [result.data, ...prev]);
        setIsAddModalOpen(false);
      } else {
        alert(result.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (project: AkaProjects) => {
    // console.log('Opening edit modal for project:', project);
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  // Submit Edit Project
  const handleEditProject = async (projectid: number, formData: AkaProjectsEditFormData) => {
    try {
      let base64Cover: string | null = null;
      if (formData.cover instanceof File) {
        base64Cover = await fileToBase64(formData.cover);
      }

      const processedGalleryImages = await Promise.all(
        (formData.project_images || [])
          .filter((img) => img.file instanceof File)
          .map(async (img) => ({
            file: await fileToBase64(img.file as File),
            order_no: Number(img.order_no) || 1,
            description: img.description || '',
          }))
      );

      const payload = {
        projectid,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        size: formData.size,
        buildup: formData.buildup,
        service: formData.service,
        status: formData.status,
        start_year: formData.start_year,
        end_year: formData.end_year,
        gallerypath: formData.gallerypath,
        category: formData.category,
        is_active: formData.is_active,
        cover: base64Cover,
        new_images: processedGalleryImages,
      };

      const res = await fetch('https://www.lifepage.in/n/api/EditProject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success === 1 && result.data) {
        const updated = result.data;
        setprojects((prev) =>
          prev.map((item) => (item.projectid === projectid ? { ...item, ...updated } : item))
        );
        setIsEditModalOpen(false);
        setSelectedProject(null);
      } else {
        alert(result.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  // Open Status Modal
  const handleOpenStatusModal = (project: AkaProjects) => {
    setSelectedProject(project);
    setIsStatusModalOpen(true);
  };

  const handleStatusSuccess = (updatedProject: AkaProjects) => {
    setprojects((prev) =>
      prev.map((p) => (String(p.projectid) === String(updatedProject.projectid) ? updatedProject : p))
    );
  };

  const ProjectList = Array.isArray(projects) ? projects : [];
  const filteredprojects = ProjectList.filter(
    (m) =>
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AKA projects
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage Projects.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow active:scale-95"
          >
            <FiPlus className="text-base" />
            Add Project
          </button>
        </div>

        {/* Card Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or category..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <span className="text-xs font-medium text-slate-400">
              {filteredprojects.length} {filteredprojects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Project</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Size</th>
                  <th scope="col" className="px-6 py-3.5">Buildup</th>
                  <th scope="col" className="px-6 py-3.5">Services</th>
                  <th scope="col" className="px-6 py-3.5">Start Year</th>
                  <th scope="col" className="px-6 py-3.5">End Year</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredprojects.length > 0 ? (
                  filteredprojects.map((project) => (
                    <tr key={project.projectid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Photo & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-11 w-11 shrink-0 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-100">
                            {project.cover ? (
                              <Image
                                src={project.cover}
                                alt={project.title}
                                fill
                                sizes="44px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                                {project.title ? project.title.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">
                              {project.title}
                            </div>
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-50">
                              {project.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {project.category || 'General'}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">{project.size || 'N/A'}</div>
                      </td>

                      {/* Buildup */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">
                          {project.buildup || 'N/A'}
                        </div>
                      </td>

                      {/* Services */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">
                          {project.service || 'N/A'}
                        </div>
                      </td>

                      {/* Start Year */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">
                          {project.start_year || 'N/A'}
                        </div>
                      </td>

                      {/* End Year */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium text-sm">
                          {project.end_year || 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            project.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              project.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {project.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(project)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit project"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(project)}
                            title={project.is_active ? 'Deactivate project' : 'Activate project'}
                            className={`p-2 rounded-lg transition-colors ${
                              project.is_active
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {project.is_active ? (
                              <FiSlash className="w-4 h-4" />
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                      No projects found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProject}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        project={selectedProject}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleEditProject}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        project={selectedProject}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={handleStatusSuccess}
      />
    </main>
  );
}