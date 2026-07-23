document.addEventListener('DOMContentLoaded', () => {

  // Comparison table — hover a row across all three columns
  const cells = document.querySelectorAll('.tcompare-table .compare-cell[data-row]');
  cells.forEach(cell => {
    const row = cell.getAttribute('data-row');
    cell.addEventListener('mouseenter', () => {
      document.querySelectorAll(`.tcompare-table .compare-cell[data-row="${row}"]`)
        .forEach(c => c.classList.add('compare-cell--row-hover'));
    });
    cell.addEventListener('mouseleave', () => {
      document.querySelectorAll(`.tcompare-table .compare-cell[data-row="${row}"]`)
        .forEach(c => c.classList.remove('compare-cell--row-hover'));
    });
  });

  // Tech hero video — pause/play based on visibility, fallback on error
  const video = document.querySelector('.tech-hero-video');
  if (video) {
    video.addEventListener('error', () => {
      video.style.display = 'none';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(video);
  }
});


document.addEventListener('DOMContentLoaded', () => {

const turbineData = {
'1mw-unit': {
      title: '1 MW SHK Turbine Unit',
      desc: 'Utility-scale single-unit turbine engineered for MW-level output.',
      media: [
        {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784713791/1_MW_SHK_turbine_unit_compressed_aalgnk.mp4',
          poster: './img/anemometer_lights_cctv.0001.00_00_00_00.Still003.png',
          thumb: './img/anemometer_lights_cctv.0001.00_00_00_00.Still003.png',
          caption: '1 MW SHK Turbine Unit — field footage'
        },
        { type: 'image', src: './img/anemometer_lights_cctv.0001.00_00_00_00.Still003.png', thumb: './img/anemometer_lights_cctv.0001.00_00_00_00.Still003.png', caption: '1 MW SHK Turbine Unit — overhead view with anemometer & CCTV' },
        { type: 'image', src: './img/anemometer_lights_cctv.0001.00_00_02_26.Still004.png', thumb: './img/anemometer_lights_cctv.0001.00_00_02_26.Still004.png', caption: '1 MW SHK Turbine Unit — deployment angle 2' },
        { type: 'image', src: './img/anemometer_lights_cctv.0001.00_00_04_20.Still007.png', thumb: './img/anemometer_lights_cctv.0001.00_00_04_20.Still007.png', caption: '1 MW SHK Turbine Unit — deployment angle 3' },
        { type: 'image', src: './img/anemometer_lights_cctv.0001.00_00_05_19.Still010.png', thumb: './img/anemometer_lights_cctv.0001.00_00_05_19.Still010.png', caption: '1 MW SHK Turbine Unit — deployment angle 4' },
        { type: 'image', src: './img/anemometer_lights_cctv.0001.00_00_06_11.Still011.png', thumb: './img/anemometer_lights_cctv.0001.00_00_06_11.Still011.png', caption: '1 MW SHK Turbine Unit — deployment angle 5' },
      ]
    },
    '2x250kw-unit': {
      title: '2X250 KW Turbine Unit',
      desc: 'Dual 250 kW turbine configuration for mid-scale deployment sites.',
      media: [
                {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784792160/mega_wat_level_intalation_of_shk_turbine_online-video-cutter_online-video-cutter.com_ie4gyv.mp4',
          poster: './img/250kw-unit.png',
          thumb: './img/250kw-unit.png',
          caption: '2X250 KW Turbine Unit'
        },
        { type: 'image', src: './img/250kw-unit.png', thumb: './img/250kw-unit.png', caption: '2X250 KW Turbine Unit angle 1' },
        { type: 'image', src: './img/250kw-unit1.png', thumb: './img/250kw-unit1.png', caption: '2X250 KW Turbine Unit angle 2' },
        { type: 'image', src: './img/250kw-unit2.png', thumb: './img/250kw-unit2.png', caption: '2X250 KW Turbine Unit angle 3' },
        { type: 'image', src: './img/250kw-unit3.png', thumb: './img/250kw-unit3.png', caption: '2X250 KW Turbine Unit angle 4' },
        { type: 'image', src: './img/250kw-unit4.png', thumb: './img/250kw-unit4.png', caption: '2X250 KW Turbine Unit angle 5' },
        { type: 'image', src: './img/250kw-unit5.png', thumb: './img/250kw-unit5.png', caption: '2X250 KW Turbine Unit angle 6' },
        { type: 'image', src: './img/250kw-unit6.png', thumb: './img/250kw-unit6.png', caption: '2X250 KW Turbine Unit angle 7' },
        { type: 'image', src: './img/250kw-unit7.png', thumb: './img/250kw-unit7.png', caption: '2X250 KW Turbine Unit angle 8' },
        { type: 'image', src: './img/250kw-unit8.png', thumb: './img/250kw-unit8.png', caption: '2X250 KW Turbine Unit angle 9' },
        { type: 'image', src: './img/250kw-unit9.png', thumb: './img/250kw-unit9.png', caption: '2X250 KW Turbine Unit angle 10' },
        { type: 'image', src: './img/250kw-unit10.png', thumb: './img/250kw-unit10.png', caption: '2X250 KW Turbine Unit angle 11' },
        { type: 'image', src: './img/250kw-unit11.png', thumb: './img/250kw-unit11.png', caption: '2X250 KW Turbine Unit angle 12' },                                        
        { type: 'image', src: './img/250kw-unit12.png', thumb: './img/250kw-unit12.png', caption: '2X250 KW Turbine Unit angle 13' },
        { type: 'image', src: './img/250kw-unit13.png', thumb: './img/250kw-unit13.png', caption: '2X250 KW Turbine Unit angle 14' },                                                
        { type: 'image', src: './img/250kw-unit14.png', thumb: './img/250kw-unit14.png', caption: '2X250 KW Turbine Unit angle 15' },   
        {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784734353/hydropower_ch3fhu.mp4',
          poster: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          caption: '2X250 KW turbine — field footage'
        }
      ]
    },
    '10kw-upper-fixed': {
      title: '10 KW Upper Fixed Type Turbine',
      desc: 'Compact fixed-mount turbine for smaller canals and channels.',
      media: [
              {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784730424/Deployment_of_Fixed_Tye_SHK_Turbine_at_Jim_Corbett_bpdvdb.mp4',
          poster: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          caption: '10kw-upper-fixed'
        },
              {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784732823/MOV_0030_compressed_slhmlc.mp4',
          poster: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          caption: '10kw-upper-fixed'
        },
        { type: 'image', src: './img/Fixed_type_surface_hydro_kinetic_turbine.png', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: '10 KW Upper Fixed Type Turbine' }
      ]
    },
    '150kw-floating': {
      title: '150 KW Floating Type Turbine',
      desc: 'Floating platform turbine engineered for variable water levels.',
      media: [
        {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784732823/MOV_0030_compressed_slhmlc.mp4',
          poster: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          caption: 'SHK Floating Turbine in operation — Ramgarh'
        },
        { type: 'image', src: './img/Isometric_water_View.jpg', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: '150 KW Floating Type Turbine' },
        { type: 'image', src: './img/Isometric_water_View.jpg', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: '150 KW Floating Type Turbine' },
        { type: 'image', src: './img/Isometric_water_View.jpg', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: '150 KW Floating Type Turbine' },
        { type: 'image', src: './img/Isometric_water_View.jpg', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: '150 KW Floating Type Turbine' },                        
      ]
    },
    'industrial-cooling-canal': {
      title: 'Industrial Cooling Water Canal SHK Turbine Unit',
      desc: 'Turbine unit purpose-built for thermal plant cooling water channels.',
      media: [
        { type: 'image', src: './img/Fixed_type_surface_hydro_kinetic_turbine.png', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: 'Industrial Cooling Water Canal SHK Turbine Unit' },
        {
          type: 'video',
          src: 'https://res.cloudinary.com/a07iptoj/video/upload/v1784731898/Industrial_Cooling_Water_Canal_compressed_sttl4y.mp4',
          poster: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
          caption: 'Deployment — industrial cooling water canal'
        }
      ]
    },
    'low-head-psp': {
      title: 'Low Head (2mtr – 10mtr head) SHK PSP System',
      desc: 'Pumped storage system engineered for low-head sites between 2m and 10m.',
      media: [
        { type: 'image', src: './img/Fixed_type_surface_hydro_kinetic_turbine.png', thumb: './img/Fixed_type_surface_hydro_kinetic_turbine.png', caption: 'Low Head SHK PSP System' }
      ]
    }
  };

  const modal = document.getElementById('turbineModal');
  const stage = document.getElementById('tmodalStage');
  const thumbsWrap = document.getElementById('tmodalThumbs');
  const titleEl = document.getElementById('turbineModalTitle');
  const descEl = document.getElementById('turbineModalDesc');
  const prevBtn = document.getElementById('tmodalPrev');
  const nextBtn = document.getElementById('tmodalNext');

  let currentMedia = [];
  let currentIndex = 0;

  function renderStage(index){
    const item = currentMedia[index];
    if (!item) return;
    currentIndex = index;

    stage.innerHTML = '';
    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      if (item.poster) video.poster = item.poster;
      stage.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption || '';
      stage.appendChild(img);
    }

    descEl.textContent = item.caption || '';

    thumbsWrap.querySelectorAll('.tmodal-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
    });
  }

  function buildThumbs(){
    thumbsWrap.innerHTML = '';
    currentMedia.forEach((item, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'tmodal-thumb' + (i === 0 ? ' is-active' : '');
      thumb.innerHTML = `<img src="${item.thumb || item.src}" alt="">` +
        (item.type === 'video' ? '<span class="tmodal-thumb-play">▶</span>' : '');
      thumb.addEventListener('click', () => renderStage(i));
      thumbsWrap.appendChild(thumb);
    });
  }

  function openModal(key){
    const data = turbineData[key];
    if (!data) return;

    currentMedia = data.media;
    titleEl.textContent = data.title;

    buildThumbs();
    renderStage(0);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stage.innerHTML = ''; // stop any playing video
  }

  document.querySelectorAll('.tturbine-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.getAttribute('data-turbine')));
  });

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  prevBtn.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
    renderStage(newIndex);
  });
  nextBtn.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % currentMedia.length;
    renderStage(newIndex);
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
});


/* ===== WHERE SHKT WORKS — category gallery (browse only, no selection) ===== */
(function(){
  const WT_DATA = [{"category": "Hydro Power Generation Through Flowing Water", "key": "hydro", "folder": "Hydro Power Generationt through flowing water", "items": [{"name": "Bidirectional Tidal Channels", "files": ["Bidirectional Tidal Stream Channel 2.jfif", "Bidirectional Tidal Stream Channel 3.jfif", "Bidirectional Tidal Stream Channel 4.jfif", "Bidirectional Tidal Stream Channel 5.jfif", "Bidirectional Tidal Stream Channel 6.jfif", "Bidirectional Tidal Stream Channel 7.jfif", "Bidirectional tidal channels 1.jfif"]}, {"name": "Drinking Water Treatment Plant Inlet & Outlet Channel", "files": ["Drinking Water Treatement Plant Inlet & Outlet channel 7.jfif", "Drinking Water Treatment Plant In_et & Outlet Channel 6.jfif"]}, {"name": "Hilly Stream", "files": ["Hilly Stream 1.jfif", "Hilly Stream 2.jfif", "Hilly Stream 3.jfif", "Hilly Stream 4.jfif", "Hilly Streams 1.jfif", "Himalaya_s River 1.jfif", "Himalaya_s River 2.jfif", "Himalaya_s River 3.jfif", "Himalaya_s River 4.jfif", "Himalaya_s River 5.jfif", "Himalaya_s River 6.jfif"]}, {"name": "Industrial Plant Cooling Water Channels", "files": ["Industrial Plant Cooling Water Channels 2.jfif", "Industrial Plant Cooling Water Channels 3.jfif", "Industrial Plant Cooling Water Channels.jfif"]}, {"name": "Irrigation Canal", "files": ["Lined Canal.jfif", "Small Irrigation canal.jfif", "Unlined Canal.jfif"]}, {"name": "Lift Irrigation and Drinkng water upper channel pump pipe outlet", "files": ["Lift Irrigation Canal Systems 1.jfif", "Lift Irrigation Canal Systems 2.jfif", "Lift Irrigation and Drinking water canal.jfif", "Lift Irrigation and Drinkng water upper channel pump pipe outlet.jfif", "Lifting and Drinking water canal 2.jfif"]}, {"name": "Raw Water Intake & Inlet Canal", "files": ["Raw Water Intake & Inlet Canal 1.jfif", "Raw Water Intake & Inlet Canal 2.jfif", "Raw Water Intake & Inlet Canal 3.jfif", "Raw Water Intake & Inlet Canal 4.jfif", "Raw Water Intake & Inlet Canal 5.jfif"]}, {"name": "Rivers", "files": ["Forest River 5.jfif", "Lowland or Alluvial River 1.jfif", "Lowland or Alluvial River 2.jfif", "Lowland or Alluvial River 3.jfif", "Lowland or Alluvial River 4.jfif", "Lowland or Alluvial River 5.jfif", "Lowland or Alluvial River 6.jfif", "Lowland or Alluvial River 7.jfif", "Lowland or Alluvial River 8.jfif", "Mountain River 1.jfif", "Mountain River 2.jfif", "Mountain River 3.jfif", "Mountain River 4.jfif", "Plain Ground Stream 1.jfif", "Plain Ground Stream 2.jfif", "Plain Ground Stream 3.jfif", "Plain Ground Stream 4.jfif", "Plain Ground Stream 5.jfif", "Plain Ground Stream 6.jfif"]}, {"name": "Sewage Water Channels", "files": ["Sewage Water Channels 1.jfif", "Sewage Water Channels 2.jfif", "Sewage Water Channels 3.jfif", "Sewage Water Channels 4.jfif", "Sewage Water Channels 5.jfif"]}, {"name": "Tailrace Hydropower Dam Canal", "files": ["Tailrace Hydropower Dam Canal 1.jfif", "Tailrace Hydropower Dam Canal 10.jfif", "Tailrace Hydropower Dam Canal 11.jfif", "Tailrace Hydropower Dam Canal 2.jfif", "Tailrace Hydropower Dam Canal 3.jfif", "Tailrace Hydropower Dam Canal 4.jfif", "Tailrace Hydropower Dam Canal 5.jfif", "Tailrace Hydropower Dam Canal 6.jfif", "Tailrace Hydropower Dam Canal 7.jfif", "Tailrace Hydropower Dam Canal 8.jfif", "Tailrace Hydropower Dam Canal 9.jfif"]}, {"name": "Thermal Power Plant Cooling Water Channels", "files": ["Thermal Power Plant Cooling Water Channels 1.jfif", "Thermal Power Plant Cooling Water Channels 2.jfif", "Thermal Power Plant Cooling Water Channels 3.jfif", "Thermal Power Plant Cooling Water Channels 4.jfif"]}, {"name": "Waste Water Inlet & Outlet Channels", "files": ["Waste Water Inlet & Outlet Channels 1.jfif", "Waste Water Inlet & Outlet Channels 2.jfif", "Waste Water Inlet & Outlet Channels 3.jfif", "Waste Water Inlet & Outlet Channels 4.jfif", "Waste Water Inlet & Outlet Channels 5.jfif", "Waste Water Inlet & Outlet Channels 6.jfif", "Wastewater Treatment Plant \u2013 Aerial Overview 1.jfif"]}]}, {"category": "SHK Pumped Storage Potential (PSP)", "key": "psp", "folder": "PSP", "items": [{"name": "Drnking water Treatment Plant", "files": ["drinking water treatment plants located in or near desert or bared land 1.jfif", "drinking water treatment plants located in or near desert or bared land 2.jfif"]}, {"name": "Sea Islands", "files": ["sea islands 1.jfif", "sea islands 2.jfif", "sea islands 3.jfif"]}, {"name": "Uptream and Lowerstream Reservior", "files": ["Downstream or Lower Stream1.jfif", "Upstream Reservoir 1.jfif", "Upstream Reservoir 2.jfif", "Upstream Reservoir 3.jfif"]}, {"name": "abandoned mines", "files": ["abandoned mines 1.jfif", "abandoned mines 2.jfif", "abandoned mines 3.jfif", "abandoned mines 4.jfif", "abandoned mines 5.jfif"]}, {"name": "barren islands", "files": ["barren islands 1.jfif", "barren islands 2.jfif", "barren islands 3.jfif", "barren islands 4.jfif"]}, {"name": "barren or sparsely vegetated islands close to cities", "files": ["barren or sparsely vegetated islands close to cities 1.jfif", "barren or sparsely vegetated islands close to cities 2.jfif", "desert landscapes directly adjacent to the sea 1.jfif", "desert landscapes directly adjacent to the sea 2.jfif", "desert landscapes directly adjacent to the sea 3.jfif", "desert landscapes directly adjacent to the sea 4.jfif", "desert landscapes directly adjacent to the sea 5.jfif"]}, {"name": "coastal sea wetlands", "files": ["coastal sea wetlands 1.jfif", "coastal sea wetlands 2.jfif", "coastal sea wetlands 3.jfif", "coastal sea wetlands 4.jfif"]}, {"name": "desert landscapes with rivers and irrigation canals", "files": ["desert landscapes with rivers and irrigation canals 1.jfif", "desert landscapes with rivers and irrigation canals 2.jfif", "desert landscapes with rivers and irrigation canals 3.jfif", "desert landscapes with rivers and irrigation canals 4.jfif"]}, {"name": "large water ponds, reservoirs, and storage lagoons located outside cities or villages", "files": ["large water ponds, reservoirs, and storage lagoons located outside cities or villages 1.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 2.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 3.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 4.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 5.jfif"]}, {"name": "sewage treatment plants (STPs) located in desert", "files": ["sewage treatment plants (STPs) located in desert 1.jfif", "sewage treatment plants (STPs) located in desert 2.jfif", "sewage treatment plants (STPs) located in desert 3.jfif", "sewage treatment plants (STPs) located in desert 4.jfif", "sewage treatment plants (STPs) located in desert 5.jfif", "sewage treatment plants (STPs) located in desert 6.jfif"]}, {"name": "wasteland or barren land located adjacent to lakes, ponds, or reservoirs", "files": ["wasteland or barren land located adjacent to lakes, ponds, or reservoirs 1.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 2.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 3.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 4.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 5.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 6.jfif"]}, {"name": "wetlands located on the outskirts of cities", "files": ["wetlands located on the outskirts of cities 1.jfif", "wetlands located on the outskirts of cities 2.jfif", "wetlands located on the outskirts of cities 3.jfif", "wetlands located on the outskirts of cities 4.jfif"]}]}];

  const grid = document.getElementById('twhere-grid');
  const tabs = document.getElementById('twhere-tabs');
  if (!grid || !tabs) return;

  let activeKey = 'hydro';

  function encPath(parts){
    return parts.map(p => encodeURIComponent(p)).join('/');
  }
  function imgSrc(folder, sub, file){
    return 'img/' + encPath([folder, sub, file]);
  }
  function cleanName(file){
    return file
      .replace(/\.[a-zA-Z0-9]+$/, '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function esc(str){
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function renderGrid(key){
    const cat = WT_DATA.find(c => c.key === key);
    grid.innerHTML = '';
    if (!cat) return;

    cat.items.forEach((item, idx) => {
      const cover = imgSrc(cat.folder, item.name, item.files[0]);

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'twhere-card';
      card.dataset.key = key;
      card.dataset.idx = idx;

      card.innerHTML = `
        <img src="${cover}" alt="${esc(item.name)}" loading="lazy">
        <span class="twhere-card-count">${item.files.length} photo${item.files.length > 1 ? 's' : ''}</span>
        <span class="twhere-overlay">
          <h3>${esc(item.name)}</h3>
          <p>Tap to view gallery</p>
        </span>
      `;
      grid.appendChild(card);
    });
  }

  tabs.querySelectorAll('.twhere-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.twhere-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeKey = tab.dataset.cat;
      renderGrid(activeKey);
    });
  });

  renderGrid(activeKey);

  /* ----- Modal (browse only) ----- */
  const modal = document.getElementById('twhere-modal');
  const modalBackdrop = document.getElementById('twhere-modal-backdrop');
  const modalClose = document.getElementById('twhere-modal-close');
  const modalCat = document.getElementById('twhere-modal-cat');
  const modalTitle = document.getElementById('twhere-modal-title');
  const modalCount = document.getElementById('twhere-modal-count');
  const modalImage = document.getElementById('twhere-modal-image');
  const modalImageName = document.getElementById('twhere-modal-image-name');
  const modalThumbs = document.getElementById('twhere-modal-thumbs');
  const modalPrev = document.getElementById('twhere-modal-prev');
  const modalNext = document.getElementById('twhere-modal-next');

  let galCat = null, galItem = null, galPhotoIdx = 0;

  function openGallery(key, idx){
    const cat = WT_DATA.find(c => c.key === key);
    if (!cat) return;
    const item = cat.items[idx];
    if (!item) return;

    galCat = cat;
    galItem = item;
    galPhotoIdx = 0;

    modalCat.textContent = cat.category;
    modalTitle.textContent = item.name;
    renderPhoto();
    renderThumbs();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

const modalImageWrap = document.getElementById('twhere-modal-image-wrap');
  // (remove the old `modalImage` const — no longer needed)

  function isVideoFile(file){
    return /\.(mp4|webm|mov|m4v)$/i.test(file);
  }

  function renderPhoto(){
    const file = galItem.files[galPhotoIdx];
    const src = imgSrc(galCat.folder, galItem.name, file);

    modalImageWrap.innerHTML = '';
    if (isVideoFile(file)) {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      modalImageWrap.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = galItem.name + ' — ' + cleanName(file);
      modalImageWrap.appendChild(img);
    }

    modalCount.textContent = 'Photo ' + (galPhotoIdx + 1) + ' of ' + galItem.files.length;
    modalImageName.textContent = cleanName(file);

    modalThumbs.querySelectorAll('.twhere-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === galPhotoIdx);
    });
  }

  function renderThumbs(){
    modalThumbs.innerHTML = '';
    galItem.files.forEach((file, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'twhere-thumb' + (i === 0 ? ' active' : '');
      const src = imgSrc(galCat.folder, galItem.name, file);

      if (isVideoFile(file)) {
        thumb.innerHTML = `<video src="${src}" muted preload="metadata"></video><span class="twhere-thumb-play">▶</span>`;
      } else {
        thumb.innerHTML = `<img src="${src}" alt="${esc(cleanName(file))}" loading="lazy">`;
      }

      thumb.addEventListener('click', () => {
        galPhotoIdx = i;
        renderPhoto();
      });
      modalThumbs.appendChild(thumb);
    });
  }

function closeGallery(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalImageWrap.innerHTML = ''; 
  }

  function stepPhoto(dir){
    if (!galItem) return;
    const len = galItem.files.length;
    galPhotoIdx = (galPhotoIdx + dir + len) % len;
    renderPhoto();
  }

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.twhere-card');
    if (!card) return;
    openGallery(card.dataset.key, parseInt(card.dataset.idx, 10));
  });

  modalBackdrop.addEventListener('click', closeGallery);
  modalClose.addEventListener('click', closeGallery);
  modalPrev.addEventListener('click', () => stepPhoto(-1));
  modalNext.addEventListener('click', () => stepPhoto(1));

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') stepPhoto(-1);
    if (e.key === 'ArrowRight') stepPhoto(1);
  });
})();


(function(){
  const slides = document.querySelectorAll('.tcompare-slide');
  const dotsContainer = document.getElementById('tcompareDots');
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer = null;
  const interval = 4000; // 4 seconds per slide

  // build dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'tcompare-dot' + (i === 0 ? ' is-active' : '');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(btn);
  });

  const dots = dotsContainer.querySelectorAll('.tcompare-dot');

  function goTo(index){
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    resetTimer();
  }

  function next(){
    goTo((current + 1) % slides.length);
  }

  function resetTimer(){
    if (timer) clearInterval(timer);
    timer = setInterval(next, interval);
  }

  resetTimer();
})();