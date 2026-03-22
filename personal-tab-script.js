
// <!-- =============personal-tabing-section script======================= -->

{/* <script>  */}
  gsap.registerPlugin(ScrollTrigger);

  // Helper: Get height of closed element
  function getAutoHeight(element) {
      gsap.set(element, { height: "auto" });
      const height = element.offsetHeight;
      gsap.set(element, { height: 0 }); 
      return height;
  }

  window.addEventListener("load", () => {
      // Select all items using generic classes (Works for 3, 4, 10, or 20 items automatically)
      const accItems = document.querySelectorAll(".acc-item");
      const visuals = document.querySelectorAll(".visual-item");
      const balls = document.querySelectorAll(".ball");

      // Calculate exact slide up distance based on the first item
      const headerHeight = document.querySelector(".acc-header").offsetHeight;
      const accItemStyle = window.getComputedStyle(accItems[0]);
      const marginBottom = parseFloat(accItemStyle.marginBottom);
      const slideUpDistance = headerHeight + marginBottom;

      // --- Context Rectangles for Origins/Destinations ---
      const pinMaster = document.querySelector("#pin-master");
      const masterRect = pinMaster.getBoundingClientRect();
      
      const startX = masterRect.width / 2;
      const startY = 0; 
      const endX = masterRect.width / 2;
      const endY = masterRect.height - 30; 
      
      const endCoords = [];

      // Dynamically prep all balls
      balls.forEach((ball, index) => {
          const ballRect = ball.getBoundingClientRect();
          
          const diffStartX = startX - (ballRect.left - masterRect.left + ballRect.width / 2);
          const diffStartY = startY - (ballRect.top - masterRect.top + ballRect.height / 2);
          
          // Store the bottom destination for each ball
          endCoords.push({
              x: endX - (ballRect.left - masterRect.left + ballRect.width / 2),
              y: endY - (ballRect.top - masterRect.top + ballRect.height / 2)
          });

          gsap.set(ball, { x: diffStartX, y: diffStartY, opacity: 1, scale: 0.5 });
      });

      // Adjust total scroll duration based on how many items exist
      const totalScrollDuration = accItems.length * 1500;

      // --- Master Timeline ---
      const tl = gsap.timeline({
          scrollTrigger: {
              trigger: "#pin-master",
              start: "top top",
              end: "+=" + totalScrollDuration, 
              pin: true,
              scrub: 1, 
              anticipatePin: 1
          }
      });

      // PHASE 0: ALL balls fly in from Top-Center
      tl.addLabel("start")
        .to(balls, { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, "start");


      // DYNAMIC LOOP: Build the open/close sequence for every item
      accItems.forEach((item, index) => {
          const content = item.querySelector(".acc-content");
          const lis = content.querySelectorAll("li");
          const h = getAutoHeight(content);
          const vis = visuals[index];
          const span = item.querySelector(".acc-header > span");
          
          // Get the unique color for this heading from the HTML data attribute
          const targetColor = item.getAttribute("data-color") || "#000";
          
          let phaseLabel = "phase" + index;

          if (index === 0) {
              // First item just opens
              tl.addLabel(phaseLabel, "start+=0.4")
                .to(span, { color: targetColor, duration: 0.3 }, phaseLabel)
                .to(content, { height: h, duration: 0.6, ease: "power2.inOut" }, phaseLabel)
                .to(vis, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, phaseLabel)
                .to(lis, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }, phaseLabel + "+=0.2");
          } else {
              // All subsequent items: Close the Previous, then Open the Current
              let prevItem = accItems[index - 1];
              let prevContent = prevItem.querySelector(".acc-content");
              let prevLis = prevContent.querySelectorAll("li");
              let prevVis = visuals[index - 1];
              let prevSpan = prevItem.querySelector(".acc-header > span");
              let prevSlot = prevItem.querySelector(".dotted-slot");
              let prevBall = prevItem.querySelector(".ball");

              tl.addLabel(phaseLabel, "+=0.5")
                
                // 1. Close Previous Content
                .to(prevLis, { opacity: 0, x: -20, duration: 0.3, stagger: -0.05 }, phaseLabel)
                .to(prevContent, { height: 0, duration: 0.6, ease: "power2.inOut" }, phaseLabel + "+=0.2")
                
                // 2. Hide Previous Header & Ball
                .to(prevSpan, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, phaseLabel + "+=0.2")
                .to(prevSlot, { borderColor: "transparent", duration: 0.6, ease: "power2.inOut" }, phaseLabel + "+=0.2")
                .to(prevBall, { opacity: 0, duration: 0.1, ease: "power2.inOut" }, phaseLabel + "+=0.2")
                
                // 3. Slide Previous Parent Up
                .to(prevItem, { marginTop: -slideUpDistance, duration: 0.6, ease: "power2.inOut" }, phaseLabel + "+=0.2")
                .to(prevVis, { opacity: 0, scale: 0.95, duration: 0.4 }, phaseLabel)
                
                // 4. Open Current Content
                .to(span, { color: targetColor, duration: 0.3 }, phaseLabel + "+=0.2")
                .to(content, { height: h, duration: 0.6, ease: "power2.inOut" }, phaseLabel + "+=0.2")
                .to(vis, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, phaseLabel + "+=0.2")
                .to(lis, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }, phaseLabel + "+=0.4");
          }
      });


      // OUTRO PHASE: Close the very last item in the list
      const lastIdx = accItems.length - 1;
      const lastItem = accItems[lastIdx];
      const lastContent = lastItem.querySelector(".acc-content");
      const lastLis = lastContent.querySelectorAll("li");
      const lastVis = visuals[lastIdx];
      const lastSpan = lastItem.querySelector(".acc-header > span");
      const lastSlot = lastItem.querySelector(".dotted-slot");

      tl.addLabel("outro", "+=0.5")
        .to(lastLis, { opacity: 0, x: -20, duration: 0.3, stagger: -0.05 }, "outro")
        .to(lastContent, { height: 0, duration: 0.6, ease: "power2.inOut" }, "outro+=0.2")
        
        .to(lastSpan, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "outro+=0.2")
        .to(lastSlot, { borderColor: "transparent", duration: 0.6, ease: "power2.inOut" }, "outro+=0.2")
        
        .to(lastVis, { opacity: 0, scale: 0.95, duration: 0.4 }, "outro");

      // Loop through all balls to bring them to the bottom center
      balls.forEach((ball, i) => {
          // Dynamic compensation math: ensuring all balls align perfectly at the bottom
          // despite their parent containers sliding up at different times.
          const slidesApplied = Math.min(i + 1, accItems.length - 1);
          const yCompensation = endCoords[i].y + (slideUpDistance * slidesApplied);

          tl.to(ball, { 
              x: endCoords[i].x, 
              y: yCompensation, 
              opacity: 1, 
              scale: 0.5, 
              duration: 0.9, 
              ease: "power2.in" 
          }, "outro+=0.2");
      });

  });
// </script>

// <!-- =============personal-tabing-section script end======================= -->